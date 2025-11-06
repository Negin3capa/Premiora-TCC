/**
 * Componente VideoCard
 * Card específico para exibir vídeos
 */
import React from 'react';
import { Play } from 'lucide-react';
import type { ContentItem } from '../../types/content';

interface VideoCardProps {
  item: ContentItem;
  onPlay?: () => void;
}

/**
 * Card específico para vídeos
 * Exibe thumbnail, título, duração e estatísticas do vídeo
 */
const VideoCard: React.FC<VideoCardProps> = ({ item, onPlay }) => {
  return (
    <div className="video-content">
      <div className="video-thumbnail" onClick={onPlay}>
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
      <div className="video-info">
        <h3 className="content-title">{item.title}</h3>
        <p className="content-stats">
          {item.views?.toLocaleString('pt-BR')} visualizações • {item.timestamp}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
