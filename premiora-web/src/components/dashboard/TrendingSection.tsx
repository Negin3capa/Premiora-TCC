import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import '../../styles/RightSidebar.css';

interface TrendingTopic {
  id: string;
  category: string;
  topic: string;
  postsCount: string;
}

const TrendingSection: React.FC = () => {
  // Mock data - in a real app this would come from an API
  const trends: TrendingTopic[] = [
    { id: '1', category: 'Politics • Trending', topic: 'Elections 2024', postsCount: '50.4K posts' },
    { id: '2', category: 'Technology • Trending', topic: '#AIRevolution', postsCount: '22.1K posts' },
    { id: '3', category: 'Sports • Trending', topic: 'Champions League', postsCount: '15.3K posts' },
    { id: '4', category: 'Entertainment • Trending', topic: 'New Marvel Movie', postsCount: '10.2K posts' },
    { id: '5', category: 'Music • Trending', topic: 'New Album Drop', postsCount: '8.5K posts' },
  ];

  return (
    <div className="right-sidebar-section trending-section">
      <h3 className="right-sidebar-title">What's happening</h3>
      <div className="trending-list">
        {trends.map(trend => (
          <div key={trend.id} className="trending-item">
            <div className="trending-info">
              <span className="trending-category">{trend.category}</span>
              <span className="trending-topic">{trend.topic}</span>
              <span className="trending-posts">{trend.postsCount}</span>
            </div>
            <button className="trending-more" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
      </div>
      <button className="show-more-btn">Show more</button>
    </div>
  );
};

export default TrendingSection;
