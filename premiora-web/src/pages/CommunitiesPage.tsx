/**
 * Página de comunidades - Design limpo e profissional
 * Lista comunidades de forma organizada e minimalista
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Community } from '../types/community';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { ChevronRight } from 'lucide-react';
import { getCommunities, searchCommunities } from '../utils/communityUtils';
import TrendingSection from '../components/dashboard/TrendingSection';
import CommunityRightSidebar from '../components/layout/CommunityRightSidebar';
import '../styles/CommunitiesPage.css';

/**
 * Página de comunidades com design limpo e profissional
 * Foco na descoberta e navegação intuitiva
 */
const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    'All', 'Internet Culture', 'Games', 'Q&As & Stories', 'Technology', 
    'Movies & TV', 'Places & Travel', 'Pop Culture', 'Business & Finance', 
    'Sports', 'Education & Career'
  ];

  // Mock data generator for communities
  const generateMockCommunities = (): Community[] => {
    // Array de banners reais para comunidades (imagens de paisagem/tecnologia)
    const bannerUrls = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=200&fit=crop&auto=format', // Tech/coding
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=200&fit=crop&auto=format', // Digital art
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=200&fit=crop&auto=format', // Gaming
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=200&fit=crop&auto=format', // Music
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=200&fit=crop&auto=format', // Fitness
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=200&fit=crop&auto=format', // Photography
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=200&fit=crop&auto=format', // Cooking
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=200&fit=crop&auto=format'  // Design
    ];

    // Array de avatares para comunidades (ícones/tech relacionados)
    const avatarUrls = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=80&h=80&fit=crop&crop=center&auto=format', // Tech
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop&crop=center&auto=format', // Art
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop&crop=center&auto=format', // Gaming
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop&crop=center&auto=format', // Music
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop&crop=center&auto=format', // Fitness
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=80&h=80&fit=crop&crop=center&auto=format', // Photography
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop&crop=center&auto=format', // Cooking
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=80&h=80&fit=crop&crop=center&auto=format'  // Design
    ];

    const mockCommunities: Community[] = [
      {
        id: 'tech-community',
        name: 'tecnologia',
        displayName: 'Tecnologia & Inovação',
        description: 'Discussões sobre as últimas tendências em tecnologia, programação, IA e inovação digital.',
        bannerUrl: bannerUrls[0],
        avatarUrl: avatarUrls[0],
        creatorId: 'creator-1',
        isPrivate: false,
        memberCount: 15420,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'art-community',
        name: 'arte-digital',
        displayName: 'Arte Digital',
        description: 'Comunidade para artistas digitais compartilharem seus trabalhos, técnicas e inspirações.',
        bannerUrl: bannerUrls[1],
        avatarUrl: avatarUrls[1],
        creatorId: 'creator-2',
        isPrivate: false,
        memberCount: 8750,
        createdAt: '2024-02-01T14:30:00Z',
        updatedAt: '2024-02-01T14:30:00Z'
      },
      {
        id: 'gaming-community',
        name: 'gaming',
        displayName: 'Gaming & eSports',
        description: 'Tudo sobre jogos, eSports, reviews e discussões sobre a indústria dos games.',
        bannerUrl: bannerUrls[2],
        avatarUrl: avatarUrls[2],
        creatorId: 'creator-3',
        isPrivate: false,
        memberCount: 25680,
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T09:15:00Z'
      },
      {
        id: 'music-community',
        name: 'musica',
        displayName: 'Música & Produção',
        description: 'Produtores musicais, DJs e amantes da música compartilham tracks, dicas e colaborações.',
        bannerUrl: bannerUrls[3],
        avatarUrl: avatarUrls[3],
        creatorId: 'creator-4',
        isPrivate: false,
        memberCount: 12340,
        createdAt: '2024-02-10T16:45:00Z',
        updatedAt: '2024-02-10T16:45:00Z'
      },
      {
        id: 'fitness-community',
        name: 'fitness',
        displayName: 'Fitness & Saúde',
        description: 'Dicas de treino, nutrição, motivação e tudo relacionado a uma vida saudável.',
        bannerUrl: bannerUrls[4],
        avatarUrl: avatarUrls[4],
        creatorId: 'creator-5',
        isPrivate: false,
        memberCount: 18950,
        createdAt: '2024-01-25T11:20:00Z',
        updatedAt: '2024-01-25T11:20:00Z'
      },
      {
        id: 'photography-community',
        name: 'fotografia',
        displayName: 'Fotografia Profissional',
        description: 'Fotógrafos profissionais e amadores compartilham técnicas, equipamentos e portfólios.',
        bannerUrl: bannerUrls[5],
        avatarUrl: avatarUrls[5],
        creatorId: 'creator-6',
        isPrivate: false,
        memberCount: 6780,
        createdAt: '2024-02-05T13:10:00Z',
        updatedAt: '2024-02-05T13:10:00Z'
      },
      {
        id: 'cooking-community',
        name: 'culinaria',
        displayName: 'Culinária Criativa',
        description: 'Receitas inovadoras, técnicas culinárias e dicas para chefs caseiros e profissionais.',
        bannerUrl: bannerUrls[6],
        avatarUrl: avatarUrls[6],
        creatorId: 'creator-7',
        isPrivate: false,
        memberCount: 9450,
        createdAt: '2024-01-30T15:25:00Z',
        updatedAt: '2024-01-30T15:25:00Z'
      },
      {
        id: 'design-community',
        name: 'design',
        displayName: 'Design & UI/UX',
        description: 'Designers gráficos, UX/UI e criativos compartilham projetos, tutoriais e inspiração.',
        bannerUrl: bannerUrls[7],
        avatarUrl: avatarUrls[7],
        creatorId: 'creator-8',
        isPrivate: false,
        memberCount: 11200,
        createdAt: '2024-02-12T12:00:00Z',
        updatedAt: '2024-02-12T12:00:00Z'
      }
    ];

    return mockCommunities;
  };



  // Load communities on component mount
  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      try {
        const realCommunities = await getCommunities();
        setCommunities(realCommunities);
      } catch (error) {
        console.error('Erro ao carregar comunidades:', error);
        // Fallback to mock data if API fails
        const mockCommunities = generateMockCommunities();
        setCommunities(mockCommunities);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  // Handle search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        // If search is empty, reload all communities
        const loadCommunities = async () => {
          try {
            const realCommunities = await getCommunities();
            setCommunities(realCommunities);
          } catch (error) {
            console.error('Erro ao recarregar comunidades:', error);
          }
        };
        loadCommunities();
        return;
      }

      try {
        const searchResults = await searchCommunities(searchQuery);
        setCommunities(searchResults);
      } catch (error) {
        console.error('Erro ao buscar comunidades:', error);
        // Fallback to client-side filtering of mock data
        const mockCommunities = generateMockCommunities();
        const filtered = mockCommunities.filter(community =>
          community.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          community.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          community.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setCommunities(filtered);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCommunityClick = (community: Community) => {
    navigate(`/r/${community.name}`);
  };

  if (loading) {
    return (
      <div className="communities-page">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="communities-main-content">
          <div className="communities-loading">Carregando comunidades...</div>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  return (
    <div className="communities-page">
      <div className="dashboard-sidebar">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="communities-main-content">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="communities-layout">
          <div className="communities-content-container">
            {/* Header Section */}
            <div className="communities-header">
              <h1 className="page-title">Explore Communities</h1>
            </div>

            {/* Category Pills */}
            <div className="category-pills-container">
              <div className="category-pills">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
                <button className="category-pill-more">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Recommended Section */}
            <div className="communities-section">
              <h2 className="section-title">Recommended for you</h2>
              <div className="communities-grid">
                {communities.slice(0, 6).map((community: Community) => (
                  <div key={community.id} className="community-card" onClick={() => handleCommunityClick(community)}>
                    <div className="community-card-header">
                      <img
                        src={community.avatarUrl}
                        alt={community.displayName}
                        className="community-avatar"
                      />
                      <div className="community-info-header">
                        <div className="community-names">
                          <h3 className="community-display-name">{community.displayName}</h3>
                          <span className="community-handle">r/{community.name}</span>
                        </div>
                        <button className="btn-join">Join</button>
                      </div>
                    </div>
                    
                    <div className="community-stats">
                      {community.memberCount.toLocaleString()} weekly visitors
                    </div>

                    <p className="community-description">{community.description}</p>
                  </div>
                ))}
              </div>
              <button className="show-more-button">Show more</button>
            </div>

            {/* Trending Section - Horizontal List or another Grid */}
            <div className="communities-section">
              <h2 className="section-title">Trending in Technology</h2>
              <div className="communities-grid">
                {communities.filter(c => c.name.includes('tech') || c.name.includes('design') || c.name.includes('gaming')).slice(0, 3).map((community: Community) => (
                  <div key={`trend-${community.id}`} className="community-card" onClick={() => handleCommunityClick(community)}>
                    <div className="community-card-header">
                      <img
                        src={community.avatarUrl}
                        alt={community.displayName}
                        className="community-avatar"
                      />
                      <div className="community-info-header">
                        <div className="community-names">
                          <h3 className="community-display-name">{community.displayName}</h3>
                          <span className="community-handle">r/{community.name}</span>
                        </div>
                        <button className="btn-join">Join</button>
                      </div>
                    </div>
                    
                    <div className="community-stats">
                      {community.memberCount.toLocaleString()} members
                    </div>

                    <p className="community-description">{community.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="communities-right-sidebar">
            <CommunityRightSidebar
              topCommunities={communities}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            >
              {/* Reuse Trending Section from Dashboard as child */}
              <TrendingSection />
            </CommunityRightSidebar>
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default CommunitiesPage;
