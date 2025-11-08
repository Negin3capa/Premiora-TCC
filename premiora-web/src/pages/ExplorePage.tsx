/**
 * Página Explore do Premiora
 * Página de descoberta com seções interativas para explorar conteúdo
 */
import React, { useState } from 'react';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { TrendingUp, Sparkles, Compass, ChevronRight, Eye, Heart, MessageCircle } from 'lucide-react';
import { useExplore } from '../hooks/useExplore';
import '../styles/ExplorePage.css';

/**
 * Página Explore - Centro de descoberta de conteúdo
 * Apresenta múltiplas seções para explorar comunidades, criadores e conteúdo
 */
const ExplorePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { data, loading, error, refresh } = useExplore();

  const topics = [
    { id: 'anime', name: 'Anime', icon: '🎭', color: '#FF424D' },
    { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#46A758' },
    { id: 'tech', name: 'Tecnologia', icon: '💻', color: '#0090FF' },
    { id: 'art', name: 'Arte', icon: '🎨', color: '#F76707' },
    { id: 'music', name: 'Música', icon: '🎵', color: '#7C3AED' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: '#059669' },
    { id: 'cooking', name: 'Culinária', icon: '👨‍🍳', color: '#DC2626' },
    { id: 'photography', name: 'Fotografia', icon: '📸', color: '#0891B2' }
  ];

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(selectedTopic === topicId ? null : topicId);
    // TODO: Implementar navegação/filtragem por tópico
  };

  if (loading) {
    return (
      <div className="explore-page">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="explore-container">
            <div className="loading-state">
              <Compass size={48} className="loading-icon" />
              <h2>Carregando Explore...</h2>
              <p>Descobrindo conteúdo incrível para você</p>
            </div>
          </div>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-page">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="explore-container">
            <div className="error-state">
              <h2>Erro ao carregar Explore</h2>
              <p>{error}</p>
              <button onClick={refresh} className="retry-button">
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  return (
    <div className="explore-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="explore-container">
          {/* Header Section */}
          <div className="explore-header">
            <div className="explore-title-section">
              <Compass size={32} className="explore-icon" />
              <div>
                <h1 className="explore-title">Explore</h1>
                <p className="explore-subtitle">
                  Descubra conteúdo incrível, conecte-se com criadores e junte-se a comunidades
                </p>
              </div>
            </div>
          </div>

          {/* Recent Communities Section */}
          <section className="explore-section">
            <div className="section-header">
              <h2 className="section-title">Acesso Recente</h2>
              <a href="/communities" className="section-link">
                Ver todas <ChevronRight size={16} />
              </a>
            </div>
            <div className="recent-communities">
              {data.recentCommunities.map((community) => (
                <div key={community.id} className="recent-community-card">
                  <img
                    src={community.avatarUrl || 'https://via.placeholder.com/80x80?text=Community'}
                    alt={community.displayName}
                    className="community-avatar"
                  />
                  <div className="community-info">
                    <h3 className="community-name">{community.displayName}</h3>
                    <p className="community-members">{(community.memberCount || 0).toLocaleString()} membros</p>
                    <p className="last-visited">Acesso recente</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Creators Section */}
          <section className="explore-section">
            <div className="section-header">
              <h2 className="section-title">Criadores Recomendados</h2>
              <a href="/creators" className="section-link">
                Ver todos <ChevronRight size={16} />
              </a>
            </div>
            <div className="creators-grid">
              {data.recommendedCreators.map((creator) => (
                <div key={creator.id} className="creator-card">
                  <div className="creator-header">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="creator-avatar"
                    />
                    {creator.isVerified && <Sparkles size={16} className="verified-badge" />}
                  </div>
                  <div className="creator-info">
                    <h3 className="creator-name">{creator.displayName}</h3>
                    <p className="creator-username">@{creator.username}</p>
                    <p className="creator-followers">{creator.followerCount.toLocaleString()} seguidores</p>
                  </div>
                  <div className="creator-featured">
                    <div className="featured-content">
                      <img
                        src={creator.featuredContent.thumbnail}
                        alt={creator.featuredContent.title}
                        className="featured-thumbnail"
                      />
                      <div className="featured-overlay">
                        <span className="content-type">{creator.featuredContent.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Content Section */}
          <section className="explore-section">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={20} />
                Em Alta
              </h2>
            </div>
            <div className="trending-content">
              {data.trendingContent.map((item) => (
                <div key={item.id} className="featured-post-container">
                  <div className="featured-post-content">
                    <div className="thumbnail-container">
                      <div className="thumbnail">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="thumbnail-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <div className="play-icon">
                              <svg viewBox="0 0 24 24" width="48" height="48">
                                <path
                                  d="M8 5v14l11-7z"
                                  fill="white"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="video-overlay">
                            <div className="play-icon">
                              <svg viewBox="0 0 24 24" width="48" height="48">
                                <path
                                  d="M8 5v14l11-7z"
                                  fill="white"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="content">
                      <h3 className="post-title">{item.title}</h3>
                      {item.content && (
                        <p className="description">{item.content}</p>
                      )}

                      <div className="metadata">
                        <span className="author-info">
                          <img
                            src={item.authorAvatar || 'https://via.placeholder.com/32x32?text=User'}
                            alt={item.author}
                            className="author-avatar-small"
                          />
                          <span className="author-name">{item.author}</span>
                        </span>
                        <span className="date">{item.timestamp}</span>
                        <span className="stat">
                          <Eye size={16} />
                          {(item.views || 0).toLocaleString()}
                        </span>
                        <span className="stat">
                          <Heart size={16} />
                          {item.likes || 0}
                        </span>
                        <span className="stat">
                          <MessageCircle size={16} />
                          {item.communityComments || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Topic Explorer Section */}
          <section className="explore-section">
            <div className="section-header">
              <h2 className="section-title">Explorar por Tópicos</h2>
            </div>
            <div className="topics-grid">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className={`topic-pill ${selectedTopic === topic.id ? 'active' : ''}`}
                  onClick={() => handleTopicClick(topic.id)}
                  style={{ '--topic-color': topic.color } as React.CSSProperties}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-name">{topic.name}</span>
                </button>
              ))}
            </div>
            {selectedTopic && (
              <div className="topic-results">
                <p>Mostrando conteúdo relacionado a <strong>{topics.find(t => t.id === selectedTopic)?.name}</strong></p>
                {/* TODO: Implementar resultados filtrados por tópico */}
              </div>
            )}
          </section>

          {/* Newcomers Section */}
          <section className="explore-section">
            <div className="section-header">
              <h2 className="section-title">
                <Sparkles size={20} />
                Novos Criadores
              </h2>
            </div>
            <div className="newcomers-grid">
              {data.newcomers.map((newcomer) => (
                <div key={newcomer.id} className="newcomer-card">
                  <div className="newcomer-header">
                    <img
                      src={newcomer.avatarUrl}
                      alt={newcomer.displayName}
                      className="newcomer-avatar"
                    />
                    <span className="new-badge">{newcomer.badge}</span>
                  </div>
                  <div className="newcomer-info">
                    <h3 className="newcomer-name">{newcomer.displayName}</h3>
                    <p className="newcomer-username">@{newcomer.username}</p>
                    <p className="newcomer-joined">{newcomer.joinDate}</p>
                    <p className="newcomer-followers">{newcomer.followerCount} seguidores</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Communities Section */}
          <section className="explore-section">
            <div className="section-header">
              <h2 className="section-title">Comunidades Recomendadas</h2>
              <a href="/communities" className="section-link">
                Ver todas <ChevronRight size={16} />
              </a>
            </div>
            <div className="communities-grid">
              {data.recommendedCommunities.map((community) => (
                <div key={community.id} className="community-card">
                  <div className="community-banner">
                    <img
                      src={community.bannerUrl}
                      alt={community.displayName}
                      className="banner-image"
                    />
                    <div className="banner-overlay">
                      <img
                        src={community.avatarUrl}
                        alt={community.displayName}
                        className="community-avatar"
                      />
                    </div>
                  </div>
                  <div className="community-info">
                    <h3 className="community-name">{community.displayName}</h3>
                    <p className="community-tag">r/{community.name}</p>
                    <p className="community-description">{community.description}</p>
                    <div className="community-meta">
                      <span className="member-count">{community.memberCount.toLocaleString()} membros</span>
                    </div>
                  </div>
                  <div className="community-actions">
                    <button className="join-button">Juntar-se</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default ExplorePage;
