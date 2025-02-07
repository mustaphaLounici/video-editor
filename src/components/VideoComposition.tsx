import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  Video 
} from 'remotion';
import {
  TimelineTrack,
  Media,
  ImageMedia,
  TextMedia,
  VideoMedia,
} from '../types/editor';
import { secondsToFrames } from '../utils/duration';

interface VideoCompositionProps {
  tracks: TimelineTrack[];
  selectedMediaIds: string[];
  config: {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
  };
}

const ImageSequence: React.FC<{ media: ImageMedia }> = ({ media }) => {
  const { data } = media;
  // Combine crop transform and scale transform into one property.
  const transform = `${data.crop ? `translate(${-data.crop.x}px, ${-data.crop.y}px)` : ''} scale(${data.scale ?? 1})`.trim();

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <img
        src={data.src}
        style={{
          width: data.crop ? `${data.crop.width}px` : '100%',
          height: data.crop ? `${data.crop.height}px` : '100%',
          objectFit: 'contain',
          opacity: data.opacity ?? 1,
          transform,
        }}
        alt=""
      />
    </AbsoluteFill>
  );
};

const TextSequence: React.FC<{ media: TextMedia }> = ({ media }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          color: media.data.color,
          fontSize: `${media.data.fontSize ?? 48}px`,
          fontFamily: media.data.fontFamily ?? 'sans-serif',
          fontWeight: 'bold',
          textAlign: media.data.alignment ?? 'center',
        }}
      >
        {media.data.text}
      </div>
    </AbsoluteFill>
  );
};

const VideoSequence: React.FC<{ media: VideoMedia }> = ({ media }) => {
  // Use Remotion's <Video> component to automatically sync the video.
  const videoStyle = {
    width: media.data.crop ? `${media.data.crop.width}px` : '100%',
    height: media.data.crop ? `${media.data.crop.height}px` : '100%',
    objectFit: 'contain',
    transform: media.data.crop
      ? `translate(${-media.data.crop.x}px, ${-media.data.crop.y}px)`
      : undefined,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <Video
        src={media.data.src}
        style={videoStyle as React.CSSProperties}
        volume={media.data.volume ?? 1}
        playbackRate={media.data.speed ?? 1}
      />
    </AbsoluteFill>
  );
};

const MediaSequence: React.FC<{ media: Media; isSelected: boolean }> = ({ media }) => {
  switch (media.type) {
    case 'image':
      return <ImageSequence media={media as ImageMedia} />;
    case 'text':
      return <TextSequence media={media as TextMedia} />;
    case 'video':
      return <VideoSequence media={media as VideoMedia} />;
    default:
      return null;
  }
};

const TrackSequence: React.FC<{ track: TimelineTrack; selectedMediaIds: string[] }> = ({
  track,
  selectedMediaIds,
}) => {
  if (!track.visible) return null;

  return (
    <AbsoluteFill>
      {track.medias.map((media) => {
        const isSelected = selectedMediaIds.includes(media.id);

        return (
          <Sequence
            key={media.id}
            from={secondsToFrames(media.start)}
            durationInFrames={secondsToFrames(media.end - media.start)}
          >
            <div
              style={{
                opacity: isSelected ? 1 : 0.7,
                pointerEvents: track.locked ? 'none' : 'auto',
                zIndex: media.zIndex ?? 0,
              }}
            >
              <MediaSequence media={media} isSelected={isSelected} />
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  tracks,
  selectedMediaIds,
}) => {
  if (!tracks.length || tracks.every((track) => !track.medias?.length)) {
    return (
      <AbsoluteFill style={{ backgroundColor: 'black' }}>
        <div
          style={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          No content to display
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {tracks.map((track) => (
        <TrackSequence key={track.id} track={track} selectedMediaIds={selectedMediaIds} />
      ))}
    </AbsoluteFill>
  );
};
