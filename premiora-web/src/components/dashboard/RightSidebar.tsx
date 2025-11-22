import React from 'react';
import { Search } from 'lucide-react';
import TrendingSection from './TrendingSection';
import WhoToFollow from './WhoToFollow';
import '../../styles/RightSidebar.css';

const RightSidebar: React.FC = () => {
  return (
    <div className="right-sidebar">
      <div className="right-sidebar-search">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search Premiora" className="search-input" />
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
