# Screen Lock Button Card for Home Assistant

A custom Lovelace card for Home Assistant that adds a screen lock functionality with a PIN code unlock mechanism. This card displays a button that, when pressed, locks the screen with a blackout overlay. The screen can be unlocked by entering the correct PIN code.

## Features

- Simple lock button that can be placed anywhere in your Home Assistant dashboard
- Full-screen blackout when locked
- Numeric keypad for PIN code entry
- Configurable PIN code
- Customizable button text
- Auto-timeout that returns to blackout screen after inactivity
- Mobile-friendly design with responsive sizing

## Installation

### Manual Installation

1. Download the `Dash-lock.js` file from this repository
2. Copy the file to your Home Assistant configuration directory under `/www/` (create the folder if it doesn't exist)
3. Add the following to your Lovelace resources:

```yaml
resources:
  - url: /local/Dash-lock.js
    type: module
```

### HACS Installation

1. Add this repository to HACS as a custom repository
   - Go to HACS in your Home Assistant instance
   - Click on the three dots in the top right corner and select "Custom repositories"
   - Add the URL of this repository (`https://github.com/JMatuszczakk/Lock-Dashboard`) and select "Lovelace" as the category
2. Install the "Screen Lock Button Card" through HACS
   - Find the card in the Frontend section of HACS
   - Click Install
   - Wait for installation to complete
3. Add the card to your resources in your Lovelace configuration:

```yaml
resources:
  - url: /hacsfiles/screen-lock-button-card/Dash-lock.js
    type: module
```

4. Restart Home Assistant
5. Refresh your browser cache

## Usage

Add the card to your dashboard using the UI editor or manually in your YAML configuration:

### UI Configuration

1. Edit your dashboard
2. Click the "+" button to add a new card
3. Search for "Screen Lock Button Card"
4. Configure the options as needed

### YAML Configuration

```yaml
type: 'custom:screen-lock-button-card'
code: '1234'  # Your desired PIN code (default: 1234)
button_text: 'Lock Screen'  # Optional custom button text
```

## Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `code` | string | `1234` | The PIN code required to unlock the screen |
| `button_text` | string | `Lock Screen` | Text displayed on the lock button |

## Security Note

This card provides a basic screen locking mechanism and is not intended as a security feature. The PIN code is stored in the browser and can be viewed in your configuration. It's designed to prevent accidental interactions with your dashboard, not to secure sensitive information.

## License

MIT License

## Acknowledgments

Blackout and lock logic adapted from ScreenSaverMixin.