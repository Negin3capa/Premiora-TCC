import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { TrendingService, type TrendingTopic } from '../../services/content/TrendingService';
import '../../styles/RightSidebar.css';

const TrendingSection: React.FC = () => {
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const result = await TrendingService.getTrendingTopics({ limit: 5 });
        setTrends(result.topics);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trends:', err);
        setError('Failed to load trends');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="right-sidebar-section trending-section">
        <h3 className="right-sidebar-title">What's happening</h3>
        <div className="trending-loading">Loading trends...</div>
      </div>
    );
  }

  if (error || trends.length === 0) {
    // Fallback UI or empty state
    return (
      <div className="right-sidebar-section trending-section">
        <h3 className="right-sidebar-title">What's happening</h3>
        <div className="trending-empty">No trends available right now.</div>
      </div>
    );
  }

  return (
    <div className="right-sidebar-section trending-section">
      <h3 className="right-sidebar-title">What's happening</h3>
      <div className="trending-list">
        {trends.map(trend => (
          <div key={trend.id} className="trending-item">
            <div className="trending-info">
              <span className="trending-category">
                {trend.category} {trend.trendReason === 'burst' ? '• Trending' : ''}
              </span>
              <span className="trending-topic">{trend.title || trend.key}</span>
              <span className="trending-posts">
                {trend.totalMentions > 1000 
                  ? `${(trend.totalMentions / 1000).toFixed(1)}K posts` 
                  : `${trend.totalMentions} posts`}
              </span>
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
