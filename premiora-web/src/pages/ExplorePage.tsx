/**
 * Página Explore do Premiora
 * Página de descoberta com seções interativas para explorar conteúdo
 */
import React, { useState, useRef } from 'react';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { Compass, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { useExplore } from '../hooks/useExplore';
import TrendingSection from '../components/dashboard/TrendingSection';
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
      <div className="explore-main-content">
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="explore-page-container">
            <div className="explore-loading-state">
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
        <div className="explore-main-content">
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="explore-page-container">
            <div className="explore-error-state">
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
      <div className="dashboard-sidebar">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="explore-main-content">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="explore-layout">
          <div className="explore-content-container">
            {/* Search Bar */}
            <div className="explore-search-container">
              <div className="explore-search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search creators, posts, or communities" 
                  className="explore-search-input" 
                />
              </div>
            </div>

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

            {/* Recommended Creators Grid (Patreon Style) */}
            <section className="creators-section">
              <h2 className="section-title">Recommended Creators</h2>
              <div className="creators-grid">
                {data.recommendedCreators.map((creator) => (
                  <div key={creator.id} className="creator-card">
                    <div className="creator-cover" style={{ backgroundImage: `url(${creator.avatarUrl})` }}></div>
                    <div className="creator-info">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.displayName}
                        className="creator-avatar"
                      />
                      <h3 className="creator-name">{creator.displayName}</h3>
                      <p className="creator-category">Creating content</p>
                      <div className="creator-stats">
                        <span>12k followers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Explore Topics Section */}
            <section className="topics-section">
              <h2 className="section-title">Explore Topics</h2>
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
          </div>

          {/* Right Sidebar (Trending) */}
          <div className="explore-right-sidebar">
            <TrendingSection />
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default ExplorePage;
