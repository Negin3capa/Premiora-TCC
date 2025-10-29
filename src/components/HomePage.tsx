import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../premiora-landing/src/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Feed from './Feed';
import '../styles/HomePage.css';

export interface ContentItem {
  id: string;
  type: 'profile' | 'video' | 'post' | 'live';
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail?: string;
  content?: string;
  views?: number;
  likes?: number;
  timestamp: string;
  isLive?: boolean;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Mock data generator
  const generateMockContent = useCallback((startIndex: number, count: number): ContentItem[] => {
    const types: ContentItem['type'][] = ['profile', 'video', 'post', 'live'];
    const mockItems: ContentItem[] = [];

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const type = types[Math.floor(Math.random() * types.length)];
      
      mockItems.push({
        id: `item-${index}`,
        type,
        title: type === 'profile' ? `Creator ${index}` : `${type.charAt(0).toUpperCase() + type.slice(1)} Content ${index}`,
        author: `User ${index}`,
        authorAvatar: `/placeholder.svg?height=40&width=40`,
        thumbnail: type !== 'profile' ? `/placeholder.svg?height=200&width=300` : undefined,
        content: type === 'post' ? `This is a sample post content ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.` : undefined,
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        timestamp: `${Math.floor(Math.random() * 24)}h ago`,
        isLive: type === 'live' ? Math.random() > 0.5 : false
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
