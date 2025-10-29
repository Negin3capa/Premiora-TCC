import React, { useEffect, useRef } from 'react';
import ContentCard from './ContentCard';
import type { ContentItem } from './HomePage';

interface FeedProps {
  items: ContentItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const Feed: React.FC<FeedProps> = ({ items, loading, hasMore, onLoadMore }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <main className="feed">
      <div className="feed-content">
        {items.length === 0 && !loading ? (
          <div className="empty-state">
            <p>Nenhum conteúdo encontrado</p>
          </div>
        ) : (
          <div className="content-grid">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando mais conteúdo...</p>
          </div>
        )}

        <div ref={loadMoreRef} className="load-more-trigger" />
      </div>
    </main>
  );
};

export default Feed;
