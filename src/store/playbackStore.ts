import { create } from 'zustand';
import { DURATION_CONFIG } from '../utils/duration';
import { PlaybackState, PlaybackActions, TimeInSeconds } from '../types/editor';

interface ExtendedPlaybackActions extends PlaybackActions {
  togglePlayback: () => void;
  toggleMute: () => void;
}

interface PlaybackStore extends PlaybackState, ExtendedPlaybackActions {}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  // Initial State
  currentTime: 0,
  currentFrame: 0,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  playbackRate: 1,

  // Playback Controls
  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlayback: () => {
    const state = get();
    if (state.isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },
  
  seek: (time: TimeInSeconds) => {
    const validTime = Math.max(0, time);
    set({ 
      currentTime: validTime,
      currentFrame: Math.round(validTime * DURATION_CONFIG.FPS)
    });
  },

  // Audio Controls
  setVolume: (volume) => set({ 
    volume: Math.max(0, Math.min(1, volume)),
    isMuted: volume === 0
  }),
  
  toggleMute: () => set((state) => ({ 
    isMuted: !state.isMuted,
    volume: state.isMuted ? (state.volume || 1) : 0
  })),

  // Playback Settings
  setPlaybackRate: (rate) => set({ 
    playbackRate: Math.max(0.25, Math.min(4, rate)) 
  })
})); 