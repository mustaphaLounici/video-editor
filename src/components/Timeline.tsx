import React, { MouseEvent, useRef, useEffect, useState, useMemo } from 'react';
import { Timeline as TimelineEditor, TimelineRow, TimelineAction, TimelineState } from '@xzdarcy/react-timeline-editor';
import { useTimelineStore } from '../store/timelineStore';
import { usePlaybackStore } from '../store/playbackStore';

// Custom render components for each media type
const VideoRender: React.FC<{ action: TimelineAction; row: TimelineRow }> = ({ action }) => (
  <div className="flex items-center justify-center h-full w-full bg-blue-600/50 border border-blue-400 rounded-sm px-2 overflow-hidden">
    <span className="text-white text-sm truncate">🎥 Video</span>
  </div>
);

const ImageRender: React.FC<{ action: TimelineAction; row: TimelineRow }> = ({ action }) => (
  <div className="flex items-center justify-center h-full w-full bg-green-600/50 border border-green-400 rounded-sm px-2 overflow-hidden">
    <span className="text-white text-sm truncate">🖼️ Image</span>
  </div>
);

const TextRender: React.FC<{ action: TimelineAction; row: TimelineRow }> = ({ action }) => (
  <div className="flex items-center justify-center h-full w-full bg-purple-600/50 border border-purple-400 rounded-sm px-2 overflow-hidden">
    <span className="text-white text-sm truncate">📝 Text</span>
  </div>
);

const mediaTypeToEffect = {
  image: { id: 'image', name: 'Image' },
  text: { id: 'text', name: 'Text' },
  video: { id: 'video', name: 'Video' }
};

interface EditorTrack extends TimelineRow {
  actions: TimelineAction[];
  selected?: boolean;
}

// Custom scale renderer component
const CustomScale: React.FC<{ scale: number }> = ({ scale }) => {
  const minutes = Math.floor(scale / 60);
  const seconds = Math.floor(scale % 60);
  return <span>{minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : seconds}</span>;
};

export const Timeline: React.FC = () => {
  const [autoScroll, setAutoScroll] = useState(true);
  
  const {
    tracks,
    selectedMediaIds,
    selectedTrackIds,
    updateMedia,
    selectMedia,
    deselectMedia,
    selectTrack,
    deselectTrack,
    clearSelection,
  } = useTimelineStore();

  const { 
    seek,
    currentTime,
    isPlaying,
    play,
    pause
  } = usePlaybackStore();

  const timelineStateRef = useRef<TimelineState>(null);

  // Calculate max end time of media from all tracks, fallback to 60 seconds if none
  const maxEnd = Math.max(
    ...tracks.flatMap(track => track.medias.map(media => media.end)),
    60
  );

  // Calculate scale and scaleWidth based on content duration
  const { scale, scaleWidth, scaleSplitCount } = useMemo(() => {
    let scale: number;
    let scaleSplitCount = 10;

    if (maxEnd <= 60) {
      // For durations under 1 minute, show 1-second intervals
      scale = 1;
    } else if (maxEnd <= 300) {
      // For durations under 5 minutes, show 5-second intervals
      scale = 5;
    } else if (maxEnd <= 900) {
      // For durations under 15 minutes, show 15-second intervals
      scale = 15;
    } else {
      // For longer durations, show 30-second intervals
      scale = 30;
    }
    
    // Each scale unit should be at least 50px wide
    const scaleWidth = 50;

    return { scale, scaleWidth, scaleSplitCount };
  }, [maxEnd]);

  // Convert our tracks to timeline editor format
  const editorTracks: EditorTrack[] = tracks.map(track => ({
    id: track.id,
    name: track.name,
    actions: track.medias.map(media => ({
      id: media.id,
      effectId: media.type,
      start: media.start,
      end: media.end
    })),
    selected: selectedTrackIds.includes(track.id)
  }));

  // Sync timeline state with playback state
  useEffect(() => {
    if (timelineStateRef.current) {
      timelineStateRef.current.setTime(currentTime);
    }
  }, [currentTime]);

  // Handle play/pause state
  useEffect(() => {
    if (timelineStateRef.current) {
      if (isPlaying) {
        timelineStateRef.current.play({ toTime: currentTime });
      } else {
        timelineStateRef.current.pause();
      }
    }
  }, [isPlaying, currentTime]);

  const handleChange = (newData: TimelineRow[]) => {
    // Handle media updates (position/duration changes)
    newData.forEach((track) => {
      track.actions?.forEach((action) => {
        const originalTrack = tracks.find(t => t.id === track.id);
        const originalMedia = originalTrack?.medias.find(m => m.id === action.id);
        
        if (originalTrack && originalMedia) {
          if (originalMedia.start !== action.start || originalMedia.end !== action.end) {
            updateMedia(action.id, {
              start: action.start,
              end: action.end
            });
          }
        }
      });
    });
  };

  const handleTrackClick = (trackId: string) => {
    clearSelection();
    selectTrack(trackId);
  };

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Handler for clicks on the timeline container to seek
  const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Calculate new time based on click position relative to container width
    const newTime = (clickX / containerWidth) * maxEnd;
    console.log(`Timeline clicked at x=${clickX}; seeking to time=${newTime.toFixed(2)}s`);

    // Update the shared playback state
    seek(newTime);
  };

  return (
    <div className="bg-[#1a1a1a] overflow-hidden flex flex-col gap-2">
      <div className="flex items-center px-4">
        <label className="text-white flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-4 h-4"
          />
          Auto-scroll timeline
        </label>
      </div>
      <div className="overflow-auto">
        <TimelineEditor
          ref={timelineStateRef}
          onChange={handleChange}
          editorData={editorTracks}
          effects={mediaTypeToEffect}
          autoScroll={autoScroll}
          scale={scale}
          scaleWidth={scaleWidth}
          scaleSplitCount={scaleSplitCount}
          getScaleRender={(scaleValue) => <CustomScale scale={scaleValue} />}
          getActionRender={(action, row) => {
            switch (action.effectId) {
              case 'video':
                return <VideoRender action={action} row={row} />;
              case 'image':
                return <ImageRender action={action} row={row} />;
              case 'text':
                return <TextRender action={action} row={row} />;
              default:
                return null;
            }
          }}
          style={{
            background: '#1a1a1a',
            color: '#fff',
            height: 200,
            width: '100%'
          }}
          onClickAction={(_, { action }) => {
            // Handle selection
            if (selectedMediaIds.includes(action.id)) {
              deselectMedia(action.id);
            } else {
              selectMedia(action.id);
            }
          }}
          onClickRow={(e: MouseEvent<HTMLElement>, { row, time }: { row: TimelineRow; time: number }) => {
            handleTrackClick(row.id);
            // When clicking a row, also seek to that time
            if (typeof time === 'number') {
              seek(time);
            }
          }}
        />
      </div>
    </div>
  );
}; 