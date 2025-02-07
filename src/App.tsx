import { useState } from 'react';
import { Timeline } from './components/Timeline';
import { Preview } from './components/Preview';
import { useTimeline } from './hooks/useTimeline';
import { TextData } from './types/editor';

function App() {
  // Initialize timeline hook
  const timeline = useTimeline();

  // Text input state
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#4A90E2');

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Bar */}
      <div className="h-12 bg-[#2a2a2a] flex items-center px-4 gap-4">
        {/* Add Text Button */}
        <button 
          className="px-3 py-1 bg-[#333] hover:bg-[#444] rounded"
          onClick={() => timeline.addItem('text', { 
            text, 
            color: textColor,
            fontSize: 48,
            fontFamily: 'sans-serif',
            alignment: 'center'
          } as TextData)}
        >
          + Text
        </button>

        {/* Add Image Button */}
        <button 
          className="px-3 py-1 bg-[#333] hover:bg-[#444] rounded"
          onClick={() => timeline.handleFileSelect('image')}
        >
          + Image
        </button>

        {/* Add Video Button */}
        <button 
          className="px-3 py-1 bg-[#333] hover:bg-[#444] rounded"
          onClick={() => timeline.handleFileSelect('video')}
        >
          + Video
        </button>

        {/* Track Selector */}
        <select 
          className="px-3 py-1 bg-[#333] hover:bg-[#444] rounded text-white"
          value={timeline.selectedTrackId}
          onChange={(e) => timeline.setSelectedTrackId(e.target.value)}
        >
          {timeline.tracks.map(track => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Preview Area */}
          <div className="flex-1 p-6">
            <Preview />
          </div>

          {/* Right Sidebar */}
          <div className="w-64 bg-[#2a2a2a] p-4">
            <div className="space-y-4">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Text</label>
                <input
                  type="text"
                  className="w-full bg-[#333] border border-[#444] rounded px-2 py-1"
                  placeholder="Enter text..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  className="block w-8 h-8 rounded"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Area */}
        <div className="h-48 bg-[#2a2a2a]">
          <Timeline />
        </div>
      </div>
    </div>
  );
}

export default App;
