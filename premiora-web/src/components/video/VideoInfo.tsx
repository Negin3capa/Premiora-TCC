/**
 * Componente de informações do vídeo
 * Exibe título, estatísticas e descrição do vídeo
 */
import React from 'react';
import type { ContentItem } from '../../types/content';

/**
 * Props do componente VideoInfo
 */
interface VideoInfoProps {
  /** Item de conteúdo do vídeo */
  item: ContentItem;
  /** Número de curtidas */
  likes: number;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente VideoInfo - Informações do vídeo
 */
export const VideoInfo: React.FC<VideoInfoProps> = ({
  item,
  likes,
  className = ''
}) => {
  return (
    <div className={`video-info ${className}`}>
      <h1 className="video-title">{item.title}</h1>

      <div className="video-stats">
        <span className="views">
          {item.views?.toLocaleString('pt-BR')} visualizações
        </span>
        <span className="likes">
          {likes?.toLocaleString('pt-BR')} curtidas
        </span>
      </div>

      {/* Descrição */}
      <div className="video-description">
        <p>{item.content}</p>
      </div>
    </div>
  );
};
