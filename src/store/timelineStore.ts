import { create } from 'zustand';
import { 
  Timeline, 
  Media, 
  MediaType, 
  TimeInSeconds,

  ImageData,
  TextData,
  VideoData
} from '../types/editor';

interface TimelineState extends Timeline {
  // Actions for tracks
  addTrack: (name: string) => void;
  removeTrack: (id: string) => void;
  reorderTracks: (trackIds: string[]) => void;
  
  // Actions for media
  addMedia: <T extends MediaType>(
    trackId: string, 
    type: T, 
    start: TimeInSeconds, 
    data: T extends 'image' ? ImageData : T extends 'text' ? TextData : VideoData
  ) => void;
  updateMedia: <T extends Media>(mediaId: string, updates: Partial<Omit<T, 'id' | 'type'>>) => void;
  removeMedia: (mediaId: string) => void;
  moveMedia: (mediaId: string, targetTrackId: string) => void;
  
  // Selection actions
  selectMedia: (mediaId: string) => void;
  deselectMedia: (mediaId: string) => void;
  selectTrack: (trackId: string) => void;
  deselectTrack: (trackId: string) => void;
  clearSelection: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  // Initial state
  tracks: [
    { id: '1', name: 'Track 1', medias: [], visible: true, locked: false },
    { id: '2', name: 'Track 2', medias: [], visible: true, locked: false },
    { id: '3', name: 'Track 3', medias: [], visible: true, locked: false },
  ],
  duration: 0,
  selectedMediaIds: [],
  selectedTrackIds: ['1'],

  // Track actions
  addTrack: (name) => set((state) => ({
    ...state,
    tracks: [...state.tracks, {
      id: crypto.randomUUID(),
      name,
      medias: [],
      visible: true,
      locked: false
    }]
  })),

  removeTrack: (id) => set((state) => ({
    ...state,
    tracks: state.tracks.filter(track => track.id !== id),
    selectedTrackIds: state.selectedTrackIds.filter(trackId => trackId !== id)
  })),

  reorderTracks: (trackIds) => set((state) => ({
    ...state,
    tracks: trackIds.map(id => state.tracks.find(track => track.id === id)!)
  })),

  // Media actions
  addMedia: (trackId, type, start, data) => set((state) => {
    const mediaId = crypto.randomUUID();
    const mediaBase = {
      id: mediaId,
      type,
      start,
      // For videos, use their actual duration, otherwise default to 5 seconds
      end: start + (type === 'video' && 'duration' in data ? (data as any).duration : 5),
      data
    };

    const media = mediaBase as Media;

    return {
      ...state,
      tracks: state.tracks.map(track => 
        track.id === trackId
          ? { ...track, medias: [...track.medias, media] }
          : track
      )
    };
  }),

  updateMedia: (mediaId, updates) => set((state) => ({
    ...state,
    tracks: state.tracks.map(track => ({
      ...track,
      medias: track.medias.map(media =>
        media.id === mediaId
          ? { ...media, ...updates }
          : media
      )
    }))
  })),

  removeMedia: (mediaId) => set((state) => ({
    ...state,
    tracks: state.tracks.map(track => ({
      ...track,
      medias: track.medias.filter(media => media.id !== mediaId)
    })),
    selectedMediaIds: state.selectedMediaIds.filter(id => id !== mediaId)
  })),

  moveMedia: (mediaId, targetTrackId) => set((state) => {
    let mediaToMove: Media | undefined;
    
    // Remove media from source track
    const tracksWithoutMedia = state.tracks.map(track => {
      const mediaIndex = track.medias.findIndex(m => m.id === mediaId);
      if (mediaIndex !== -1) {
        mediaToMove = track.medias[mediaIndex];
        return {
          ...track,
          medias: track.medias.filter(m => m.id !== mediaId)
        };
      }
      return track;
    });

    if (!mediaToMove) return state;

    // Add media to target track
    return {
      ...state,
      tracks: tracksWithoutMedia.map(track =>
        track.id === targetTrackId
          ? { ...track, medias: [...track.medias, mediaToMove!] }
          : track
      )
    };
  }),

  // Selection actions
  selectMedia: (mediaId) => set((state) => ({
    ...state,
    selectedMediaIds: [...state.selectedMediaIds, mediaId]
  })),

  deselectMedia: (mediaId) => set((state) => ({
    ...state,
    selectedMediaIds: state.selectedMediaIds.filter(id => id !== mediaId)
  })),

  selectTrack: (trackId) => set((state) => ({
    ...state,
    selectedTrackIds: [...state.selectedTrackIds, trackId]
  })),

  deselectTrack: (trackId) => set((state) => ({
    ...state,
    selectedTrackIds: state.selectedTrackIds.filter(id => id !== trackId)
  })),

  clearSelection: () => set(state => ({
    ...state,
    selectedMediaIds: [],
    selectedTrackIds: []
  }))
})); 