import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TrendingSection from './TrendingSection';
import WhoToFollow from './WhoToFollow';
import '../../styles/RightSidebar.css';

const RightSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="right-sidebar">
      <div className="right-sidebar-search">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Premiora" 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      <TrendingSection />
      <WhoToFollow />
      <div className="right-sidebar-footer">
        <nav className="footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Cookie Policy</a>
          <a href="#">Accessibility</a>
          <a href="#">Ads info</a>
          <span>© 2025 Premiora Corp.</span>
        </nav>
      </div>
    </div>
  );
};

export default RightSidebar;
