# AI Voice-Controlled Map of America

An interactive web application that allows users to explore locations in the United States using voice commands.

## Features

- **Interactive Map**: Built with Leaflet.js for smooth navigation and zooming
- **Voice Input**: Uses Web Speech API to convert speech to text
- **AI-Powered Location Detection**: Analyzes questions to find relevant locations
- **Information Panels**: Displays detailed information about found locations
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. Click the microphone button (🎤) in the bottom-right corner
2. Ask a question about a location in America, such as:
   - "Where is the Grand Canyon?"
   - "Show me the Statue of Liberty"
   - "Where is Mount Rushmore?"
3. The map will automatically zoom to the location and show information

## Supported Locations

The application includes information about major American landmarks:
- Grand Canyon
- Statue of Liberty  
- Golden Gate Bridge
- Mount Rushmore
- Yellowstone National Park
- Niagara Falls
- Walt Disney World
- Las Vegas
- Washington, D.C.
- Hollywood

## Technology Stack

- **Frontend**: React with TypeScript
- **Map Library**: Leaflet.js
- **Voice Recognition**: Web Speech API
- **Styling**: CSS with inline styles

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voice-controlled-map
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Browser Compatibility

Voice recognition works best in:
- Google Chrome
- Microsoft Edge
- Safari (limited support)

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Application header
│   ├── InfoPanel.tsx   # Location information display
│   ├── MapComponent.tsx # Interactive map
│   └── VoiceButton.tsx # Voice input button
├── services/           # Business logic
│   ├── aiService.ts    # Location analysis
│   └── voiceService.ts # Speech recognition
├── types/              # TypeScript definitions
│   ├── index.ts        # Main types
│   └── speech.d.ts     # Speech API types
├── App.tsx             # Main application component
└── App.css             # Global styles
```

## Future Enhancements

- Integration with real AI APIs (OpenAI, Google AI)
- Expanded location database
- Image support for locations
- Voice responses
- Mobile app version
- Search history
- Favorite locations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
