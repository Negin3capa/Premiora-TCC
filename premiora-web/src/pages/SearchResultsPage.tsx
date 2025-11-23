import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Users, ArrowLeft } from 'lucide-react';
import { SearchService } from '../services/content/SearchService';
import type { Community } from '../types/community';
import { Sidebar, MobileBottomBar } from '../components/layout';
import RightSidebar from '../components/dashboard/RightSidebar';
import Header from '../components/layout/Header';
import ContentCard from '../components/ContentCard/ContentCard';
import '../styles/HomePage.css';
import '../styles/SearchResultsPage.css';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'communities' | 'posts'>('all');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [results, setResults] = useState<{
    users: any[];
    communities: Community[];
    content: any[];
  }>({ users: [], communities: [], content: [] });

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const data = await SearchService.globalSearch(query, {
          usersLimit: 20,
          communitiesLimit: 20,
          contentLimit: 20
        });
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleBack = () => {
    navigate(-1);
  };

  const renderUsers = () => (
    <div className="results-section">
      <h3>People</h3>
      {results.users.length === 0 ? (
        <p className="no-results">No people found.</p>
      ) : (
        <div className="results-grid">
          {results.users.map(user => (
            <div key={user.id} className="result-card user-card" onClick={() => navigate(`/u/${user.username}`)}>
              <div className="result-icon">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="result-avatar" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="result-info">
                <span className="result-title">{user.name || user.username}</span>
                <span className="result-subtitle">@{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCommunities = () => (
    <div className="results-section">
      <h3>Communities</h3>
      {results.communities.length === 0 ? (
        <p className="no-results">No communities found.</p>
      ) : (
        <div className="results-grid">
          {results.communities.map(community => (
            <div key={community.id} className="result-card community-card" onClick={() => navigate(`/r/${community.name}`)}>
              <div className="result-icon">
                {community.avatarUrl ? (
                  <img src={community.avatarUrl} alt={community.name} className="result-avatar" />
                ) : (
                  <Users size={24} />
                )}
              </div>
              <div className="result-info">
                <span className="result-title">r/{community.name}</span>
                <span className="result-subtitle">{community.memberCount || 0} members</span>
                {community.description && <p className="result-description">{community.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPosts = () => (
    <div className="results-section">
      <h3>Posts</h3>
      {results.content.length === 0 ? (
        <p className="no-results">No posts found.</p>
      ) : (
        <div className="results-list">
          {results.content.map(post => (
            <ContentCard key={post.id} item={post} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <div className="dashboard-main-content">
        <Header 
          className="dashboard-header"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="dashboard-layout">
          <div className="dashboard-feed-container">
            <div className="search-results-container">
              <div className="search-header-simple">
                <button onClick={handleBack} className="back-button-simple">
                  <ArrowLeft size={20} />
                </button>
                <h2>Search results for "{query}"</h2>
              </div>

              <div className="search-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  Top
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'people' ? 'active' : ''}`}
                  onClick={() => setActiveTab('people')}
                >
                  People
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'communities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('communities')}
                >
                  Communities
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
              </div>

              <div className="search-content">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    {activeTab === 'all' && (
                      <>
                        {renderUsers()}
                        {renderCommunities()}
                        {renderPosts()}
                      </>
                    )}
                    {activeTab === 'people' && renderUsers()}
                    {activeTab === 'communities' && renderCommunities()}
                    {activeTab === 'posts' && renderPosts()}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="dashboard-right-sidebar-container">
            <RightSidebar />
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default SearchResultsPage;
