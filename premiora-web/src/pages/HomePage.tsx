import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { ContentItem } from '../types/content';
import { Sidebar, Header } from '../components/layout';
import Feed from '../components/content/Feed';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Mock data generator
  const generateMockContent = useCallback((startIndex: number, count: number): ContentItem[] => {
    const types: ContentItem['type'][] = ['profile', 'video', 'post'];
    const accessLevels: ContentItem['accessLevel'][] = ['public', 'supporters', 'premium'];
    const mockItems: ContentItem[] = [];

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const type = types[Math.floor(Math.random() * types.length)];
      const accessLevel = type === 'post' ? accessLevels[Math.floor(Math.random() * accessLevels.length)] : undefined;

      const baseContent = type === 'post'
        ? `Este é um conteúdo de exemplo ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
        : undefined;

      mockItems.push({
        id: `item-${index}`,
        type,
        title: type === 'profile' ? `Criador ${index}` : `${type.charAt(0).toUpperCase() + type.slice(1)} ${index}`,
        author: `Usuário ${index}`,
        authorAvatar: `/placeholder.svg?height=40&width=40`,
        thumbnail: type !== 'profile' ? `/placeholder.svg?height=200&width=300` : undefined,
        content: baseContent,
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        timestamp: `${Math.floor(Math.random() * 24)}h atrás`,
        // Propriedades de acesso para posts
        accessLevel,
        isLocked: accessLevel !== 'public' && Math.random() > 0.5,
        previewContent: accessLevel !== 'public'
          ? `Este é um preview do conteúdo exclusivo ${index}. Veja apenas uma parte...`
          : undefined,
        requiredTier: accessLevel === 'supporters' ? 'Apoiadores' : accessLevel === 'premium' ? 'Premium' : undefined,
        fullContent: accessLevel !== 'public'
          ? `${baseContent}\n\nConteúdo completo exclusivo para ${accessLevel === 'supporters' ? 'apoiadores' : 'assinantes premium'}! Este é o conteúdo adicional que só membros podem ver. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
          : undefined
      });
    }

    return mockItems;
  }, []);

  // Load initial content
  useEffect(() => {
    setLoading(true);
    const initialContent = generateMockContent(0, 10);
    setFeedItems(initialContent);
    setLoading(false);
  }, [generateMockContent]);

  // Load more content for infinite scroll
  const loadMoreContent = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const newContent = generateMockContent(feedItems.length, 10);
      setFeedItems(prev => [...prev, ...newContent]);
      setPage(prev => prev + 1);
      
      // Simulate end of content after 5 pages
      if (page >= 5) {
        setHasMore(false);
      }
      
      setLoading(false);
    }, 1000);
  }, [loading, hasMore, feedItems.length, page, generateMockContent]);

  // Filter content based on search
  const filteredItems = feedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="homepage">
      <Sidebar />
      <div className="main-content">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />
        <Feed 
          items={filteredItems}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMoreContent}
        />
      </div>
    </div>
  );
};

export default HomePage;
