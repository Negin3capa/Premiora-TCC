/**
 * Componente VideoCard
 * Card específico para exibir vídeos
 */
import React, { useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import type { ContentItem } from '../../types/content';
import { VideoService } from '../../services/content/VideoService';

interface VideoCardProps {
  item: ContentItem;
  onPlay?: (e: React.MouseEvent) => void;
}

/**
 * Card específico para vídeos
 * Exibe thumbnail, título, duração e estatísticas do vídeo
 */
const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeId = useMemo(() => {
    if (typeof item.videoUrl === 'string' && item.videoUrl) {
      return VideoService.getYouTubeId(item.videoUrl);
    }
    return null;
  }, [item.videoUrl]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  const renderPlayer = () => {
    if (youtubeId) {
      return (
        <div className="video-player-wrapper" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    
    return (
        <div className="video-player-wrapper" onClick={(e) => e.stopPropagation()}>
          <video
            src={item.videoUrl}
            poster={item.thumbnail}
            autoPlay
            controls
            className="inline-video-player"
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>
    );
  };

  /**
   * Formata a duração em segundos para o formato MM:SS ou HH:MM:SS
   */
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-content">
      {isPlaying && item.videoUrl ? (
        renderPlayer()
      ) : (
        <div className="video-thumbnail" onClick={handlePlay}>
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
          />
          <div className="play-overlay">
            <span className="play-icon"><Play size={24} /></span>
          </div>
          {item.duration !== undefined && (
            <div className="video-duration">
              {formatDuration(item.duration)}
            </div>
          )}
        </div>
      )}
      <div className="video-info">
        <h3 className="content-title">{item.title}</h3>
        {item.content && (
          <div className="video-description">
            {item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '')}
          </div>
        )}
        <p className="content-stats">
          {item.views?.toLocaleString('pt-BR')} visualizações • {item.timestamp}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
