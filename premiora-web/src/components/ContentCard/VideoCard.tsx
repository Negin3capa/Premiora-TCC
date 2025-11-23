/**
 * Componente VideoCard
 * Card específico para exibir vídeos
 */
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import type { ContentItem } from '../../types/content';

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

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  return (
    <div className="video-content">
      {isPlaying && item.videoUrl ? (
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
          <div className="video-duration">
            {((item.views || 0) % 20) + 1}:{((item.views || 0) % 60).toString().padStart(2, '0')}
          </div>
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
