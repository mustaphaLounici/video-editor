import { useState, useCallback } from 'react';
import { parseMedia } from '@remotion/media-parser';
import { webFileReader } from '@remotion/media-parser/web-file';
import { 
  TimelineTrack, 
  Media, 
  MediaType, 
  TimeInSeconds,
  ImageData,
  TextData,
  VideoData
} from '../types/editor';
import { getTotalDuration, createTimeSegment } from '../utils/duration';
import { useTimelineStore } from '../store/timelineStore';
import { usePlaybackStore } from '../store/playbackStore';

interface UseTimelineOptions {
  initialTracks?: TimelineTrack[];
}

export const useTimeline = (options: UseTimelineOptions = {}) => {
  const {
    tracks,
    selectedTrackIds,
    addMedia,
    selectTrack,
    deselectTrack
  } = useTimelineStore();

  const { currentTime, seek } = usePlaybackStore();

  // Add media item to selected track
  const addItem = useCallback((
    type: MediaType, 
    data: ImageData | TextData | VideoData
  ) => {
    const selectedTrackId = selectedTrackIds[0];
    console.log('addItem', type, data);
    console.log('selectedTrackId', selectedTrackId);
    if (!selectedTrackId) return;

    addMedia(
      selectedTrackId,
      type,
      currentTime,
      data
    );
  }, [selectedTrackIds, currentTime, addMedia]);

  // Add media item (image or video)
  const addMediaItem = useCallback(async (type: 'image' | 'video', file: File) => {
    console.log('addMediaItem', type, file);
    
    if (type === 'video') {
      let objectUrl: string | undefined;
      try {
        const metadata = await parseMedia({
          src: file,
          reader: webFileReader,
          fields: {
            durationInSeconds: true,
            dimensions: true
          }
        });

        console.log('Video metadata:', metadata);
        
        objectUrl = URL.createObjectURL(file);
        addItem(type, { 
          src: objectUrl,
          volume: 1,
          speed: 1,
          duration: metadata.durationInSeconds || 5 // Fallback to 5 seconds if duration not available
        });
      } catch (error) {
        console.error('Error parsing video:', error);
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }
    } else {
      // For images, use base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        console.log('src', src);
        addItem(type, { src });
      };
      reader.onerror = (error) => console.error('Error reading image:', error);
      reader.readAsDataURL(file);
    }
  }, [addItem]);

  // Handle file selection
  const handleFileSelect = useCallback(async (type: 'image' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      console.log('file', file);
      if (file) {
        await addMediaItem(type, file);
      }
    };
    
    input.click();
  }, [addMediaItem]);

  // Handle track selection
  const setSelectedTrackId = useCallback((trackId: string) => {
    selectTrack(trackId);
  }, [selectTrack]);

  return {
    // State
    tracks,
    currentTime,
    selectedTrackId: selectedTrackIds[0] ?? '',

    // Actions
    setSelectedTrackId,
    addItem,
    addMediaItem,
    handleFileSelect,
  };
}; 