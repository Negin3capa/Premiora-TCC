import React from 'react';
import { Search } from 'lucide-react';
import type { Community } from '../../types/community';
import { useNavigate } from 'react-router-dom';
import '../../styles/CommunityRightSidebar.css';

interface CommunityRightSidebarProps {
  topCommunities: Community[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children?: React.ReactNode;
}

const CommunityRightSidebar: React.FC<CommunityRightSidebarProps> = ({ 
  topCommunities, 
  searchQuery, 
  onSearchChange,
  children
}) => {
  const navigate = useNavigate();

  return (
    <div className="community-right-sidebar">
      {/* Search Bar */}
      <div className="sidebar-search-container">
        <div className="sidebar-search-input-wrapper">
          <Search size={18} className="sidebar-search-icon" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="sidebar-search-input"
          />
        </div>
      </div>

      {/* Top Communities Widget */}
      <div className="sidebar-widget top-communities-widget">
        <h3 className="widget-title">Top Communities</h3>
        <div className="top-communities-list">
          {topCommunities.slice(0, 5).map((community, index) => (
            <div 
              key={`top-${community.id}`} 
              className="top-community-item"
              onClick={() => navigate(`/r/${community.name}`)}
            >
              <span className="rank-number">{index + 1}</span>
              <img 
                src={community.avatarUrl} 
                alt={community.displayName} 
                className="community-avatar-small" 
              />
              <div className="top-community-info">
                <span className="top-community-name">r/{community.name}</span>
                <span className="top-community-members">{community.memberCount.toLocaleString()} members</span>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-see-more">See All</button>
      </div>

      {/* Additional Widgets passed as children */}
      {children}

      {/* Footer/Links (Optional, matching Reddit style) */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <span>About</span>
          <span>Careers</span>
          <span>Press</span>
        </div>
        <div className="footer-links">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Policy</span>
        </div>
        <div className="copyright">
          Premiora © 2024. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default CommunityRightSidebar;
