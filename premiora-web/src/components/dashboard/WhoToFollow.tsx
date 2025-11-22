import React from 'react';
import '../../styles/RightSidebar.css';

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

const WhoToFollow: React.FC = () => {
  // Mock data - in a real app this would come from an API
  const users: SuggestedUser[] = [
    { id: '1', name: 'Design Daily', username: '@designdaily', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
    { id: '2', name: 'Tech Insider', username: '@techinsider', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
    { id: '3', name: 'Art World', username: '@artworld', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  ];

  return (
    <div className="right-sidebar-section who-to-follow-section">
      <h3 className="right-sidebar-title">Who to follow</h3>
      <div className="suggested-users-list">
        {users.map(user => (
          <div key={user.id} className="suggested-user-item">
            <img src={user.avatar} alt={user.name} className="suggested-user-avatar" />
            <div className="suggested-user-info">
              <span className="suggested-user-name">{user.name}</span>
              <span className="suggested-user-username">{user.username}</span>
            </div>
            <button className="follow-btn">
              Follow
            </button>
          </div>
        ))}
      </div>
      <button className="show-more-btn">Show more</button>
    </div>
  );
};

export default WhoToFollow;
