import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserSuggestionsService, type UserSuggestion } from '../../services/content/UserSuggestionsService';
import { FollowService } from '../../services/followService';
import '../../styles/RightSidebar.css';

const WhoToFollow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const result = await UserSuggestionsService.getUserSuggestions(user.id, 3);
        setSuggestions(result);

        // Check follow status for suggestions
        if (result.length > 0) {
          const statusMap: Record<string, boolean> = {};
          await Promise.all(
            result.map(async (suggestion) => {
              const isFollowing = await FollowService.isFollowing(user.id, suggestion.id);
              statusMap[suggestion.id] = isFollowing;
            })
          );
          setFollowingMap(statusMap);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user?.id]);

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;
    
    // Optimistic update
    const isFollowing = followingMap[targetUserId];
    setFollowingMap(prev => ({ ...prev, [targetUserId]: !isFollowing }));

    try {
      if (isFollowing) {
        await FollowService.unfollowUser(user.id, targetUserId);
      } else {
        await FollowService.followUser(user.id, targetUserId);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      // Revert on error
      setFollowingMap(prev => ({ ...prev, [targetUserId]: isFollowing }));
    }
  };

  if (loading) {
    return (
      <div className="right-sidebar-section who-to-follow-section">
        <h3 className="right-sidebar-title">Who to follow</h3>
        <div className="suggestions-loading">Loading suggestions...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="right-sidebar-section who-to-follow-section">
      <h3 className="right-sidebar-title">Who to follow</h3>
      <div className="suggested-users-list">
        {suggestions.map(suggestion => (
          <div 
            key={suggestion.id} 
            className="suggested-user-item"
            onClick={() => {
              const username = suggestion.handle.startsWith('@') 
                ? suggestion.handle.slice(1) 
                : suggestion.handle;
              navigate(`/u/${username}`);
            }}
          >
            <img 
              src={suggestion.avatar || 'https://via.placeholder.com/40'} 
              alt={suggestion.username} 
              className="suggested-user-avatar" 
            />
            <div className="suggested-user-info">
              <span className="suggested-user-name">{suggestion.username}</span>
              <span className="suggested-user-username">{suggestion.handle}</span>
            </div>
            <button 
              className={`follow-btn ${followingMap[suggestion.id] ? 'following' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFollow(suggestion.id);
              }}
            >
              {followingMap[suggestion.id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
      <button 
        className="show-more-btn"
        onClick={() => navigate('/search?type=suggestions')}
      >
        Show more
      </button>
    </div>
  );
};

export default WhoToFollow;
