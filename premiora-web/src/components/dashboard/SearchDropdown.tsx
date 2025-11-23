import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Search } from 'lucide-react';
import type { Community } from '../../types/community';
import '../../styles/SearchDropdown.css';

interface SearchDropdownProps {
  results: {
    users: any[];
    communities: Community[];
    content: any[];
  };
  loading: boolean;
  visible: boolean;
  onClose: () => void;
  query: string;
  onSearch: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ results, loading, visible, onClose, query, onSearch }) => {
  const navigate = useNavigate();

  if (!visible) return null;

  if (loading) {
    return (
      <div className="search-dropdown">
        <div className="loading-item">Searching...</div>
      </div>
    );
  }

  const hasResults = results.users.length > 0 || results.communities.length > 0;

  if (!hasResults && !query) {
    return null;
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="search-dropdown">
      {results.users.length > 0 && (
        <div className="dropdown-section">
          <div className="section-title">People</div>
          {results.users.map(user => (
            <div 
              key={user.id} 
              className="dropdown-item"
              onClick={() => handleNavigate(`/u/${user.username}`)}
            >
              <div className="item-icon">
                <User size={18} />
              </div>
              <div className="item-info">
                <div className="item-name">{user.name}</div>
                <div className="item-subtext">@{user.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.communities.length > 0 && (
        <div className="dropdown-section">
          <div className="section-title">Communities</div>
          {results.communities.map(community => (
            <div 
              key={community.id} 
              className="dropdown-item"
              onClick={() => handleNavigate(`/r/${community.name}`)}
            >
              <div className="item-icon">
                <Users size={18} />
              </div>
              <div className="item-info">
                <div className="item-name">r/{community.name}</div>
                <div className="item-subtext">{community.description?.substring(0, 30)}...</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {query && (
        <div className="dropdown-item search-for-item" onClick={onSearch}>
          <div className="item-icon">
            <Search size={18} />
          </div>
          <div className="item-info">
            <div className="item-name">Search for "{query}"</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
