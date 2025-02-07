// Time and Unit Types
export type MediaType = 'image' | 'text' | 'video';
export type TimeInSeconds = number;
export type Frame = number;

// Base Media Interface
export interface MediaBase {
  id: string;
  type: MediaType;
  start: TimeInSeconds;
  end: TimeInSeconds;
  zIndex?: number;
}

// Media-Specific Data Interfaces
export interface ImageData {
  src: string;
  crop?: CropRegion;
  opacity?: number;
  scale?: number;
}

export interface TextData {
  text: string;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface VideoData {
  src: string;
  crop?: CropRegion;
  volume?: number;
  speed?: number;
  duration?: number; // Duration in seconds
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Concrete Media Types
export interface ImageMedia extends MediaBase {
  type: 'image';
  data: ImageData;
}

export interface TextMedia extends MediaBase {
  type: 'text';
  data: TextData;
}

export interface VideoMedia extends MediaBase {
  type: 'video';
  data: VideoData;
}

export type Media = ImageMedia | TextMedia | VideoMedia;

// Timeline Structure
export interface TimelineTrack {
  id: string;
  name: string;
  medias: Media[];
  visible?: boolean;
  locked?: boolean;
}

export interface Timeline {
  tracks: TimelineTrack[];
  duration: TimeInSeconds;
  selectedMediaIds: string[];
  selectedTrackIds: string[];
}

// Remotion Integration
export interface RemotionSequence {
  mediaId: string;
  from: Frame;
  durationInFrames: Frame;
  component: React.FC<RemotionSequenceProps>;
}

export interface RemotionSequenceProps {
  media: Media;
  frame: Frame;
}

export interface CompositionConfig {
  width: number;
  height: number;
  fps: number;
  durationInFrames: Frame;
}

// Time Conversion Interface
export interface TimeUtils {
  timeToFrame: (time: TimeInSeconds) => Frame;
  frameToTime: (frame: Frame) => TimeInSeconds;
  validateTime: (time: TimeInSeconds) => TimeInSeconds;
  validateFrame: (frame: Frame) => Frame;
}

// State Interfaces
export interface PlaybackState {
  currentTime: TimeInSeconds;
  currentFrame: Frame;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
}

export interface EditorState {
  timeline: Timeline;
  playback: PlaybackState;
  composition: CompositionConfig;
  clipboard?: Media[];
}

// Store Actions
export interface TimelineActions {
  addMedia: (trackId: string, media: Omit<Media, 'id'>) => void;
  updateMedia: (mediaId: string, updates: Partial<Media>) => void;
  removeMedia: (mediaId: string) => void;
  moveMedia: (mediaId: string, targetTrackId: string) => void;
  splitMediaAt: (mediaId: string, time: TimeInSeconds) => void;
  trimMedia: (mediaId: string, start: TimeInSeconds, end: TimeInSeconds) => void;
}

export interface PlaybackActions {
  play: () => void;
  pause: () => void;
  seek: (time: TimeInSeconds) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
} 