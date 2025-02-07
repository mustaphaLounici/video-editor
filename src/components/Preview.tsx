import { Player, PlayerRef, CallbackListener } from '@remotion/player';
import { useEffect, useRef, useMemo } from 'react';
import { VideoComposition } from './VideoComposition';
import { useTimelineStore } from '../store/timelineStore';
import { usePlaybackStore } from '../store/playbackStore';
import { CompositionConfig } from '../types/editor';
import { secondsToFrames, framesToSeconds } from '../utils/duration';

// Default composition config
const DEFAULT_COMPOSITION: CompositionConfig = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 60 // 1 minute default duration
};

export const Preview: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  
  // Get state from stores
  const { tracks = [], selectedMediaIds = [] } = useTimelineStore();
  const { 
    isPlaying = false, 
    currentTime = 0,
    volume = 1,
    isMuted = false,
    playbackRate = 1,
    seek,
    play,
    pause,
    setPlaybackRate
  } = usePlaybackStore();

  // Memoize input props to prevent unnecessary re-renders
  const inputProps = useMemo(() => ({
    tracks,
    selectedMediaIds,
    config: {
      ...DEFAULT_COMPOSITION,
      durationInFrames: Math.max(
        ...tracks.flatMap(track => 
          track.medias?.map(media => secondsToFrames(media.end)) ?? []
        ),
        DEFAULT_COMPOSITION.durationInFrames
      )
    }
  }), [tracks, selectedMediaIds]);

  // Calculate total duration in frames
  const durationInFrames = inputProps.config.durationInFrames;

  // Convert current time to frame
  const currentFrame = secondsToFrames(currentTime);

  // Setup player event listeners
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate: CallbackListener<'timeupdate'> = (e) => {
      const time = framesToSeconds(e.detail.frame);
      if (Math.abs(time - currentTime) > 0.01) {
        seek?.(time);
      }
    };

    const onPlay: CallbackListener<'play'> = () => {
      if (!isPlaying && play) play();
    };

    const onPause: CallbackListener<'pause'> = () => {
      if (isPlaying && pause) pause();
    };

    const onRateChange: CallbackListener<'ratechange'> = (e) => {
      if (setPlaybackRate) setPlaybackRate(e.detail.playbackRate);
    };

    // Add event listeners
    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ratechange', onRateChange);

    // Cleanup
    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ratechange', onRateChange);
    };
  }, [currentTime, isPlaying, play, pause, seek, setPlaybackRate]);

  // Update player volume
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    
    player.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-[#1a1a1a] rounded-lg overflow-hidden relative min-h-[400px]">
        <Player
          ref={playerRef}
          component={VideoComposition}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={DEFAULT_COMPOSITION.width}
          compositionHeight={DEFAULT_COMPOSITION.height}
          fps={DEFAULT_COMPOSITION.fps}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls
          className="remotion-player"
          autoPlay={false}
          loop={false}
          initialFrame={currentFrame}
          playbackRate={playbackRate}
          renderLoading={() => (
            <div className="flex items-center justify-center w-full h-full bg-[#1a1a1a]">
              <div className="text-white">Loading...</div>
            </div>
          )}
          errorFallback={({ error }) => (
            <div className="flex items-center justify-center w-full h-full bg-[#1a1a1a]">
              <div className="text-white">Error: {error.message}</div>
            </div>
          )}
          allowFullscreen
          clickToPlay={false}
        />
      </div>
    </div>
  );
}; 