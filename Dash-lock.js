// Home Assistant Lovelace custom card: Screen Lock Button Card
// Blackout and lock logic adapted from ScreenSaverMixin (see user-provided code)
// Context7 reference: https://github.com/upstash/context7

class ScreenLockPanel {
    constructor(code) {
        this._panel = document.createElement("div");
        this._panel.classList.add("screen-lock-blackout");
        this._panel.attachShadow({ mode: "open" });
        this._code = code;
        this._unlocked = false;
        this._codeLength = code.length;
        this._timeout = null;

        const styleEl = document.createElement("style");
        styleEl.textContent = `
        :host {
          background: rgba(0,0,0,1);
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
        }
        .hidden {
          display: none !important;
        }
        .lock-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          padding: 2vw;
          border-radius: 1.5em;
          width: 100vw;
          max-width: 100vw;
          box-sizing: border-box;
          box-shadow: none;
        }
        .keypad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 2vw;
          width: 96vw;
          max-width: 600px;
          height: 72vw;
          max-height: 600px;
          margin: 0 auto;
          justify-items: stretch;
          align-items: stretch;
        }
        .digit-btn {
          font-size: clamp(2em, 10vw, 4em);
          width: 100%;
          height: 100%;
          border-radius: 0.5em;
          border: none;
          background: #181818;
          color: #fff;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
        }
        .digit-btn:active {
          background: #333;
          transform: scale(0.98);
        }
        .error {
          color: #ff5555;
          margin-top: 2vw;
          font-size: 1em;
          text-align: center;
        }
        .lock-title {
          color: #fff;
          font-size: 1.1em;
          margin-bottom: 2vw;
          letter-spacing: 0.04em;
          text-align: center;
          text-shadow: none;
        }
      `;
        this._panel.shadowRoot.appendChild(styleEl);

        // Blackout overlay
        this._blackout = document.createElement("div");
        this._blackout.setAttribute("part", "blackout");
        this._blackout.style.cssText = `
        position: fixed;
        left: 0; top: 0; right: 0; bottom: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,1);
        z-index: 10001;
      `;
        this._panel.shadowRoot.appendChild(this._blackout);

        // Lock container (hidden initially)
        this._lockContainer = document.createElement("div");
        this._lockContainer.className = "lock-container hidden";
        this._lockContainer.innerHTML = `
        <div class="lock-title">Enter unlock code:</div>
        <div class="keypad">
          <button class="digit-btn" data-digit="1">1</button>
          <button class="digit-btn" data-digit="2">2</button>
          <button class="digit-btn" data-digit="3">3</button>
          <button class="digit-btn" data-digit="4">4</button>
          <button class="digit-btn" data-digit="5">5</button>
          <button class="digit-btn" data-digit="6">6</button>
          <button class="digit-btn" data-digit="7">7</button>
          <button class="digit-btn" data-digit="8">8</button>
          <button class="digit-btn" data-digit="9">9</button>
        </div>
        <div class="error" id="lock-error" style="display:none"></div>
      `;
        this._panel.shadowRoot.appendChild(this._lockContainer);

        // Tap to show lock input
        this._blackout.addEventListener("pointerdown", () => this._showLock());

        // Keypad logic
        this._entered = "";
        this._lockContainer.querySelectorAll(".digit-btn").forEach(btn => {
            btn.onclick = () => {
                this._resetTimeout();
                const digit = btn.getAttribute("data-digit");
                if (digit !== null) {
                    this._entered += digit;
                    if (this._entered.length > this._codeLength) {
                        this._entered = this._entered.slice(-this._codeLength);
                    }
                }
                if (this._entered.length === this._codeLength) {
                    setTimeout(() => this._tryUnlock(), 120);
                }
            };
        });
    }

    _resetTimeout() {
        if (this._timeout) clearTimeout(this._timeout);
        this._timeout = setTimeout(() => {
            this._entered = "";
            this._lockContainer.classList.add("hidden");
            this._blackout.classList.remove("hidden");
        }, 5000);
    }

    show() {
        if (!document.body.contains(this._panel)) {
            document.body.appendChild(this._panel);
        }
        this._blackout.classList.remove("hidden");
        this._lockContainer.classList.add("hidden");
        this._unlocked = false;
        this._entered = "";
    }

    _showLock() {
        if (this._unlocked) return;
        this._blackout.classList.add("hidden");
        this._lockContainer.classList.remove("hidden");
        this._entered = "";
        const error = this._lockContainer.querySelector("#lock-error");
        if (error) {
            error.textContent = "";
            error.style.display = "none";
        }
        this._resetTimeout();
    }

    _tryUnlock() {
        const error = this._lockContainer.querySelector("#lock-error");
        if (this._entered === this._code) {
            this._unlocked = true;
            this.hide();
            if (this._timeout) clearTimeout(this._timeout);
        } else {
            error.textContent = "Incorrect code";
            error.style.display = "block";
            // Keep the last N digits for moving window
            this._entered = this._entered.slice(-this._codeLength);
            this._resetTimeout();
        }
    }

    hide() {
        if (this._timeout) clearTimeout(this._timeout);
        if (document.body.contains(this._panel)) {
            document.body.removeChild(this._panel);
        }
    }
}

class ScreenLockButtonCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.panel = null;
        this.code = "1234"; // Default code
    }

    setConfig(config) {
        this.config = config;
        if (config.code) this.code = config.code;
        this.panel = new ScreenLockPanel(this.code);
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
          button {
            font-size: clamp(1em, 4vw, 1.2em);
            padding: 0.7em 2em;
            background: #181818;
            color: #fff;
            border: none;
            border-radius: 2em;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            outline: none;
            user-select: none;
            width: 45vw;
            max-width: 200px;
            min-width: 80px;
            box-sizing: border-box;
            transition: background 0.15s, transform 0.1s;
          }
          button:active {
            background: #333;
            transform: scale(0.97);
          }
        </style>
        <button id="lock-btn">${this.config?.button_text || "Lock Screen"}</button>
      `;
        this.shadowRoot.getElementById("lock-btn").onclick = () => this.panel.show();
    }

    getCardSize() {
        return 1;
    }
}

customElements.define("screen-lock-button-card", ScreenLockButtonCard);

// Lovelace card registration for Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: "screen-lock-button-card",
    name: "Screen Lock Button Card",
    description: "A button that locks the screen with a blackout and unlock code."
});
