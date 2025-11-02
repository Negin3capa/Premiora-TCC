/**
 * Componente de player de vídeo
 * Player completo com controles e interface
 */
import React from 'react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';

/**
 * Props do componente VideoPlayer
 */
interface VideoPlayerProps {
  /** URL do vídeo */
  src?: string;
  /** URL do poster/thumbnail */
  poster?: string;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente VideoPlayer - Player de vídeo com controles
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className = ''
}) => {
  const {
    videoRef,
    playerState,
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleVolumeChange,
    handleMute,
    handleFullscreen,
    formatTime
  } = useVideoPlayer();

  return (
    <div className={`video-player-container ${className}`}>
      <video
        ref={videoRef}
        className="video-player"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {}}
        onPause={() => {}}
      >
        {src && <source src={src} type="video/mp4" />}
        Seu navegador não suporta o elemento de vídeo.
      </video>

      {/* Controles do player */}
      <div className="video-controls">
        <div className="progress-bar">
          <input
            type="range"
            min="0"
            max={playerState.duration || 0}
            value={playerState.currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="progress-input"
          />
        </div>

        <div className="control-buttons">
          <button onClick={handlePlayPause} className="play-pause-btn">
            {playerState.isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="volume-control">
            <button onClick={handleMute} className="mute-btn">
              {playerState.isMuted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={playerState.isMuted ? 0 : playerState.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-input"
            />
          </div>

          <div className="time-display">
            {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
          </div>

          <button onClick={handleFullscreen} className="fullscreen-btn">
            {playerState.isFullscreen ? '🗗' : '🗖'}
          </button>
        </div>
      </div>
    </div>
  );
};
