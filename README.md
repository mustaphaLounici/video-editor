# Video Editor Demo

A modern, React-based video editing interface that demonstrates timeline-based media composition. This project showcases how to build a video editor with features similar to popular video editing software, using web technologies.

![Video Editor Demo](demo.png) <!-- You can add a screenshot of your application here -->

## Features

### Timeline Interface
- Multi-track video, image, and text composition
- Visual timeline with dynamic time scaling
  - Automatically adjusts scale based on content duration
  - Shows seconds for short clips
  - Shows minutes:seconds for longer content
- Color-coded media types for easy identification:
  - 🎥 Video clips (blue)
  - 🖼️ Images (green)
  - 📝 Text overlays (purple)

### Media Management
- Drag and drop media positioning
- Resize clips by dragging edges
- Multiple track support
- Track and media selection
- Auto-scrolling timeline option

### Playback Controls
- Real-time preview
- Play/Pause functionality
- Click-to-seek on timeline
- Current time indicator
- Synchronized playback state

## Technical Stack

- React
- TypeScript
- Tailwind CSS for styling
- [@xzdarcy/react-timeline-editor](https://github.com/xzdarcy/react-timeline-editor) for timeline functionality
- Zustand for state management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd video-editor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Timeline.tsx        # Main timeline component
│   ├── Preview.tsx         # Video preview component
│   └── VideoComposition.tsx # Video composition layout
├── store/
│   ├── timelineStore.ts    # Timeline state management
│   └── playbackStore.ts    # Playback state management
├── hooks/
│   └── useTimeline.ts      # Timeline-related hooks
├── types/
│   └── editor.ts           # TypeScript definitions
└── utils/
    └── duration.ts         # Time/duration utilities
```

## Usage

1. **Adding Media**
   - Use the media panel to add videos, images, or text
   - Drag media to the desired track and position

2. **Editing Timeline**
   - Drag clips to reposition
   - Drag edges to trim/extend
   - Click to select tracks or media
   - Use auto-scroll for longer sequences

3. **Playback**
   - Use transport controls to play/pause
   - Click on timeline to seek
   - Preview changes in real-time

## Contributing

This is a demo project showcasing video editing capabilities in the browser. Feel free to fork, modify, and experiment with the code.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [@xzdarcy/react-timeline-editor](https://github.com/xzdarcy/react-timeline-editor) for the timeline component
- The React community for inspiration and tools
- Everyone who contributed to the development and testing of this demo

---

**Note**: This is a demonstration project intended to showcase timeline-based editing concepts in a web browser. It's not intended for production use but rather as a learning resource and starting point for similar projects.
