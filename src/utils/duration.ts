/**
 * Configuration for duration calculations
 */
export const DURATION_CONFIG = {
  FPS: 30,                // Frames per second
  MIN_DURATION: 0.1,      // Minimum duration in seconds
  DEFAULT_DURATION: 5,    // Default duration for new items in seconds
  MIN_FRAMES: 1,         // Minimum number of frames
} as const;

/**
 * Validates and ensures a duration is within acceptable bounds
 */
export function validateDuration(durationInSeconds: number): number {
  if (typeof durationInSeconds !== 'number' || isNaN(durationInSeconds)) {
    return DURATION_CONFIG.MIN_DURATION;
  }
  return Math.max(DURATION_CONFIG.MIN_DURATION, durationInSeconds);
}

/**
 * Converts seconds to frames, ensuring the result is never less than MIN_FRAMES
 */
export function secondsToFrames(seconds: number): number {
  const frames = Math.ceil(validateDuration(seconds) * DURATION_CONFIG.FPS);
  return Math.max(DURATION_CONFIG.MIN_FRAMES, frames);
}

/**
 * Converts frames to seconds
 */
export function framesToSeconds(frames: number): number {
  return Math.max(frames, DURATION_CONFIG.MIN_FRAMES) / DURATION_CONFIG.FPS;
}

/**
 * Validates a time segment (start and end times)
 */
export interface TimeSegment {
  start: number;
  end: number;
}

export function validateTimeSegment(segment: TimeSegment): TimeSegment {
  const start = Math.max(0, segment.start);
  const minEnd = start + DURATION_CONFIG.MIN_DURATION;
  const end = Math.max(minEnd, segment.end);
  
  return { start, end };
}

/**
 * Calculates duration in frames for a time segment
 */
export function getSegmentDurationInFrames(segment: TimeSegment): number {
  const validated = validateTimeSegment(segment);
  return secondsToFrames(validated.end - validated.start);
}

/**
 * Calculates total duration from an array of time segments
 */
export function getTotalDuration(segments: TimeSegment[]): number {
  if (!segments.length) return DURATION_CONFIG.MIN_DURATION;

  return segments.reduce((maxEnd, segment) => {
    const validated = validateTimeSegment(segment);
    return Math.max(maxEnd, validated.end);
  }, 0);
}

/**
 * Creates a new time segment with validation
 */
export function createTimeSegment(start: number, duration = DURATION_CONFIG.DEFAULT_DURATION): TimeSegment {
  return validateTimeSegment({
    start: Math.max(0, start),
    end: Math.max(0, start) + validateDuration(duration)
  });
}

/**
 * Type guard to check if an object is a valid time segment
 */
export function isValidTimeSegment(segment: any): segment is TimeSegment {
  return (
    segment &&
    typeof segment === 'object' &&
    typeof segment.start === 'number' &&
    typeof segment.end === 'number' &&
    !isNaN(segment.start) &&
    !isNaN(segment.end) &&
    segment.end > segment.start
  );
}

/**
 * Formats duration for display
 */
export function formatDuration(seconds: number): string {
  const validated = validateDuration(seconds);
  const minutes = Math.floor(validated / 60);
  const remainingSeconds = Math.floor(validated % 60);
  const milliseconds = Math.floor((validated % 1) * 1000);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
} 