/**
 * Página Explore do Premiora
 * Página de descoberta com seções interativas para explorar conteúdo
 */
import React, { useState, useRef } from 'react';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { Compass, ChevronRight, ChevronLeft } from 'lucide-react';
import { useExplore } from '../hooks/useExplore';
import '../styles/ExplorePage.css';

/**
 * Página Explore - Centro de descoberta de conteúdo
 * Apresenta múltiplas seções para explorar comunidades, criadores e conteúdo
 */
const ExplorePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tudo');
  const { data, loading, error, refresh } = useExplore();

  // Refs para controle de scroll
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const recentScrollRef = useRef<HTMLDivElement>(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const topCreatorsScrollRef = useRef<HTMLDivElement>(null);

  // Categorias do topo
  const categories = [
    'Tudo', 'Animação e personagens', 'Jazz', 'Música', 'Músicos', 'Ciências',
    'Jogos de RPG', 'Rock', 'Pop', 'Hip-hop', 'Violão, guitarra e cordas', 'País'
  ];

  // Tópicos coloridos
  const colorfulTopics = [
    { id: 'podcasts', name: 'Podcasts e shows', color: '#8B1538', icon: '🎙️' },
    { id: 'boardgames', name: 'Jogos de mesa', color: '#1E40AF', icon: '🎲' },
    { id: 'music', name: 'Música', color: '#B45309', icon: '🎵' },
    { id: 'writing', name: 'Escrita', color: '#BE185D', icon: '✍️' },
    { id: 'software', name: 'Aplicativos e software', color: '#1E40AF', icon: '💻' },
    { id: 'visual-arts', name: 'Artes visuais', color: '#0369A1', icon: '🎨' },
    { id: 'videogames', name: 'Videogames', color: '#7C3AED', icon: '🎮' },
    { id: 'lifestyle', name: 'Estilo de vida', color: '#059669', icon: '🌱' },
    { id: 'crafts', name: 'Artesanato', color: '#B45309', icon: '🛠️' },
    { id: 'social-impact', name: 'Impacto social', color: '#DC2626', icon: '🌍' }
  ];

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? ref.current.scrollLeft - scrollAmount
        : ref.current.scrollLeft + scrollAmount;
      
      ref.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="explore-page">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="explore-container">
          {/* Category Filter Bar */}
          <section className="category-filter-section">
            <div className="category-scroll-container">
              <button 
                className="scroll-arrow scroll-arrow-left"
                onClick={() => handleScroll(categoryScrollRef, 'left')}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="category-scroll" ref={categoryScrollRef}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button 
                className="scroll-arrow scroll-arrow-right"
                onClick={() => handleScroll(categoryScrollRef, 'right')}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </section>

          {/* Recent Access Section */}
          <section className="carousel-section">
            <div className="section-header">
              <h2 className="section-title">Acessado recentemente</h2>
              <div className="carousel-controls">
                <button 
                  className="carousel-arrow"
                  onClick={() => handleScroll(recentScrollRef, 'left')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="carousel-arrow"
                  onClick={() => handleScroll(recentScrollRef, 'right')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="carousel-container">
              <div className="carousel-scroll" ref={recentScrollRef}>
                {data.recentCommunities.map((community) => (
                  <div key={community.id} className="recent-access-card">
                    <div className="card-image">
                      <img
                        src={community.avatarUrl || 'https://via.placeholder.com/80x80?text=Community'}
                        alt={community.displayName}
                      />
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{community.displayName}</h3>
                      <p className="card-subtitle">creating content</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recommended Creators Section */}
          <section className="carousel-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-subtitle">Com base em suas assinaturas</span>
                Criadores recomendados para você
              </h2>
              <div className="carousel-controls">
                <button 
                  className="carousel-arrow"
                  onClick={() => handleScroll(recommendedScrollRef, 'left')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="carousel-arrow"
                  onClick={() => handleScroll(recommendedScrollRef, 'right')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="carousel-container">
              <div className="carousel-scroll" ref={recommendedScrollRef}>
                {data.recommendedCreators.map((creator) => (
                  <div key={creator.id} className="recommended-creator-card">
                    <div className="creator-image">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.displayName}
                      />
                    </div>
                    <div className="creator-content">
                      <h3 className="creator-name">{creator.displayName}</h3>
                      <p className="creator-description">{creator.featuredContent.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trending This Week Section */}
          <section className="carousel-section">
            <div className="section-header">
              <h2 className="section-title">Em alta esta semana</h2>
              <div className="carousel-controls">
                <button 
                  className="carousel-arrow"
                  onClick={() => handleScroll(trendingScrollRef, 'left')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="carousel-arrow"
                  onClick={() => handleScroll(trendingScrollRef, 'right')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="carousel-container">
              <div className="trending-scroll" ref={trendingScrollRef}>
                {data.trendingContent.map((item) => (
                  <div key={item.id} className="trending-item">
                    <div className="trending-avatar">
                      <img
                        src={item.authorAvatar || 'https://via.placeholder.com/48x48?text=User'}
                        alt={item.author}
                      />
                    </div>
                    <div className="trending-content">
                      <h4 className="trending-name">{item.author}</h4>
                      <p className="trending-description">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Explore Topics Section */}
          <section className="topics-section">
            <h2 className="section-title">Explorar tópicos</h2>
            <div className="colorful-topics-grid">
              {colorfulTopics.map((topic) => (
                <button
                  key={topic.id}
                  className="colorful-topic-button"
                  style={{ backgroundColor: topic.color }}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-name">{topic.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Newcomers Section */}
          <section className="newcomers-section">
            <h2 className="section-title">Recém chegados ao Patreon</h2>
            {data.newcomers.length > 0 && (
              <div className="newcomer-featured-card">
                <div className="newcomer-image">
                  <img
                    src={data.newcomers[0].avatarUrl}
                    alt={data.newcomers[0].displayName}
                  />
                </div>
                <div className="newcomer-content">
                  <h3 className="newcomer-name">{data.newcomers[0].displayName}</h3>
                  <p className="newcomer-description">Music lessons, harmony tutorial...</p>
                </div>
              </div>
            )}
          </section>

          {/* Recommended Communities Section */}
          <section className="carousel-section">
            <div className="section-header">
              <h2 className="section-title">
                Comunidades recomendadas para você
              </h2>
              <div className="carousel-controls">
                <button
                  className="carousel-arrow"
                  onClick={() => handleScroll(topCreatorsScrollRef, 'left')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="carousel-arrow"
                  onClick={() => handleScroll(topCreatorsScrollRef, 'right')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="carousel-container">
              <div className="carousel-scroll" ref={topCreatorsScrollRef}>
                {data.recommendedCommunities.map((community) => (
                  <div key={`rec-${community.id}`} className="recommended-community-card">
                    <div className="community-image">
                      <img
                        src={community.avatarUrl || 'https://via.placeholder.com/80x80?text=Community'}
                        alt={community.displayName}
                      />
                    </div>
                    <div className="community-content">
                      <h3 className="community-name">{community.displayName}</h3>
                      <p className="community-description">
                        {community.memberCount ? `${community.memberCount} membros` : 'Comunidade ativa'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default ExplorePage;
