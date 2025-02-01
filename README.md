# Clipboard Saver

A powerful system tray application that automatically saves your clipboard history, allowing you to search and retrieve previously copied items. Perfect for developers, writers, and power users who frequently work with multiple clipboard items.

## Features

- 📋 Automatic clipboard history tracking
- 🔍 Fast search through clipboard history
- 🖥️ Clean, minimal system tray interface
- ⌨️ Global keyboard shortcut (Ctrl/Cmd + Shift + V)
- 💾 Persistent storage using SQLite
- 🔒 Secure content handling
- ⚡ Lightweight and resource-efficient

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/makalin/Clipboard-Saver.git
cd Clipboard-Saver
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

### Building from Source

To create an executable for your platform:

```bash
npm run build
```

The built application will be available in the `dist` directory.

## Usage

1. **Launch**: The app runs in your system tray after starting
2. **Access History**: 
   - Click the tray icon and select "Show History"
   - Or use the global shortcut: `Ctrl/Cmd + Shift + V`
3. **Search**: Type in the search box to filter through your clipboard history
4. **Restore**: Click any item in the history to copy it back to your clipboard
5. **Clear History**: Right-click the tray icon and select "Clear History"

## Keyboard Shortcuts

- `Ctrl/Cmd + Shift + V`: Open clipboard history
- `Escape`: Hide clipboard history window
- `Enter` (when searching): Copy selected item to clipboard

## Development

### Project Structure

```
clipboard-saver/
├── assets/
│   └── icon.png
├── main.js
├── database.js
├── index.html
├── package.json
└── README.md
```

### Technology Stack

- Electron: Cross-platform desktop application framework
- Node.js: Runtime environment
- SQLite3: Local database storage
- HTML/CSS/JavaScript: User interface

### Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## Security

- All clipboard content is stored locally on your machine
- Content is HTML-escaped to prevent XSS attacks
- No network connections are made
- Database is stored in the user's application data directory

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [SQLite](https://www.sqlite.org/) - Database engine
- [electron-builder](https://www.electron.build/) - Application builder

## Support

If you encounter any issues or have suggestions:

1. Check the [Issues](https://github.com/yourusername/clipboard-saver/issues) page
2. Create a new issue with a detailed description
3. Include your OS and app version

## Roadmap

- [ ] Add support for image clipboard content
- [ ] Implement categories/tags for clipboard items
- [ ] Add cloud sync capability
- [ ] Create browser extension integration
- [ ] Add customizable retention periods
- [ ] Implement clipboard content encryption
