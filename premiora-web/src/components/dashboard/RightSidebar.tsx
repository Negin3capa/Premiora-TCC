import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TrendingSection from './TrendingSection';
import WhoToFollow from './WhoToFollow';
import SearchDropdown from './SearchDropdown';
import CommunityInfoSection from './CommunityInfoSection';
import { SearchService } from '../../services/content/SearchService';
import type { Community } from '../../types/community';
import '../../styles/RightSidebar.css';

interface RightSidebarProps {
  communityName?: string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ communityName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    communities: Community[];
    content: any[];
  }>({ users: [], communities: [], content: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 1) {
      setLoading(true);
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await SearchService.globalSearch(query, {
            usersLimit: 3,
            communitiesLimit: 3,
            contentLimit: 3
          });
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      }, 500); // Debounce 500ms
    } else {
      setShowDropdown(false);
      setSearchResults({ users: [], communities: [], content: [] });
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="right-sidebar">
      <div className="right-sidebar-search" ref={dropdownRef}>
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Premiora" 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
          />
        </div>
        <SearchDropdown 
          results={searchResults}
          loading={loading}
          visible={showDropdown}
          onClose={() => setShowDropdown(false)}
          query={searchQuery}
          onSearch={handleManualSearch}
        />
      </div>
      
      {communityName && (
        <CommunityInfoSection communityName={communityName} />
      )}

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
