/**
 * Página de listagem de comunidades
 * Exibe todas as comunidades disponíveis com filtros e ordenação
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Community } from '../types/community';
import type { ContentItem } from '../types/content';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { Search, Flame, Users, Sparkles, Eye, Heart, Video, FileText, Calendar } from 'lucide-react';
import '../styles/CommunitiesPage.css';

/**
 * Página de comunidades que lista todas as comunidades disponíveis
 * Permite ordenação por relevância, tendência, popularidade, etc.
 */
const CommunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'trending' | 'popular' | 'new'>('popular');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communityContent, setCommunityContent] = useState<ContentItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Handler para alternar visibilidade da sidebar em dispositivos móveis
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  // Mock data generator for community showcase content
  const generateCommunityShowcaseContent = (community: Community): ContentItem[] => {
    // Array de avatares para membros da comunidade
    const memberAvatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face&auto=format'
    ];

    // Array de thumbnails para vídeos da comunidade
    const videoThumbnails = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&h=200&fit=crop&auto=format'
    ];

    const showcaseItems: ContentItem[] = [];
    const contentCount = Math.floor(Math.random() * 3) + 2; // 2-4 items per community

    for (let i = 0; i < contentCount; i++) {
      const isVideo = Math.random() > 0.5;
      showcaseItems.push({
        id: `showcase-${community.id}-${i}`,
        type: isVideo ? 'video' : 'post',
        title: isVideo
          ? `Vídeo incrível da comunidade ${community.displayName}`
          : `Post interessante sobre ${community.displayName}`,
        author: `Membro ${i + 1}`,
        authorAvatar: memberAvatars[Math.floor(Math.random() * memberAvatars.length)],
        thumbnail: isVideo ? videoThumbnails[Math.floor(Math.random() * videoThumbnails.length)] : undefined,
        content: isVideo ? undefined : `Conteúdo de exemplo da comunidade ${community.displayName}. Este é um preview do que você pode encontrar nesta comunidade incrível!`,
        views: Math.floor(Math.random() * 5000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        timestamp: `${Math.floor(Math.random() * 24)}h atrás`,
        communityId: community.id,
        communityName: community.name,
        communityAvatar: community.avatarUrl
      });
    }

    return showcaseItems;
  };

  // Load communities on component mount
  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockCommunities = generateMockCommunities();
        setCommunities(mockCommunities);
        setLoading(false);
      }, 1000);
    };

    loadCommunities();
  }, []);

  // Load showcase content when a community is selected
  useEffect(() => {
    if (selectedCommunity) {
      const showcaseContent = generateCommunityShowcaseContent(selectedCommunity);
      setCommunityContent(showcaseContent);
    }
  }, [selectedCommunity]);

  // Sort and filter communities
  const sortedAndFilteredCommunities = useMemo(() => {
    let filtered = communities.filter(community =>
      community.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add mock trending/popularity scores for sorting
    const communitiesWithScores = filtered.map(community => ({
      ...community,
      trendingScore: Math.random() * 100, // Mock trending score
      popularityScore: community.memberCount + Math.random() * 1000, // Based on member count + random
      relevanceScore: Math.random() * 100 // Mock relevance score
    }));

    switch (sortBy) {
      case 'trending':
        return communitiesWithScores.sort((a, b) => b.trendingScore - a.trendingScore);
      case 'popular':
        return communitiesWithScores.sort((a, b) => b.popularityScore - a.popularityScore);
      case 'new':
        return communitiesWithScores.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'relevance':
      default:
        return communitiesWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }, [communities, searchQuery, sortBy]);

  const handleCommunityClick = (community: Community) => {
    navigate(`/r/${community.name}`);
  };

  const handleShowcaseClick = (community: Community) => {
    setSelectedCommunity(selectedCommunity?.id === community.id ? null : community);
  };

  if (loading) {
    return (
      <div className="communities-page">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <div className="loading">Carregando comunidades...</div>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  return (
    <div className="communities-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onToggleSidebar={toggleSidebar}
        />

        <div className="communities-container">
          {/* Header Section */}
          <div className="communities-header">
            <h1 className="page-title">Comunidades</h1>
            <p className="page-subtitle">
              Descubra comunidades incríveis e conecte-se com pessoas que compartilham seus interesses
            </p>
          </div>

          {/* Sort Controls */}
          <div className="sort-controls">
            <span className="sort-label">Ordenar por:</span>
            <div className="sort-buttons">
              <button
                className={`sort-button ${sortBy === 'relevance' ? 'active' : ''}`}
                onClick={() => setSortBy('relevance')}
              >
                <Search size={16} /> Relevância
              </button>
              <button
                className={`sort-button ${sortBy === 'trending' ? 'active' : ''}`}
                onClick={() => setSortBy('trending')}
              >
                <Flame size={16} /> Tendência
              </button>
              <button
                className={`sort-button ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                <Users size={16} /> Popular
              </button>
              <button
                className={`sort-button ${sortBy === 'new' ? 'active' : ''}`}
                onClick={() => setSortBy('new')}
              >
                <Sparkles size={16} /> Novo
              </button>
            </div>
          </div>

          {/* Communities Grid */}
          <div className="communities-grid">
            {sortedAndFilteredCommunities.map((community) => (
              <div key={community.id} className="community-card">
                {/* Community Banner */}
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

                {/* Community Info */}
                <div className="community-info">
                  <h3 className="community-name">{community.displayName}</h3>
                  <p className="community-tag">r/{community.name}</p>
                  <p className="community-description">{community.description}</p>

                  <div className="community-stats">
                    <span className="stat">
                      <Users size={14} /> {community.memberCount.toLocaleString()} membros
                    </span>
                    <span className="stat">
                      <Calendar size={14} /> Criada em {new Date(community.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Community Actions */}
                <div className="community-actions">
                  <button
                    className="action-button primary"
                    onClick={() => handleCommunityClick(community)}
                  >
                    Visitar Comunidade
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => handleShowcaseClick(community)}
                  >
                    {selectedCommunity?.id === community.id ? 'Ocultar' : 'Ver Destaques'}
                  </button>
                </div>

                {/* Showcase Content */}
                {selectedCommunity?.id === community.id && (
                  <div className="community-showcase">
                    <h4 className="showcase-title">Conteúdo em Destaque</h4>
                    <div className="showcase-content">
                      {communityContent.map((item) => (
                        <div key={item.id} className="showcase-item">
                          <div className="showcase-item-header">
                            <img
                              src={item.authorAvatar}
                              alt={item.author}
                              className="showcase-author-avatar"
                            />
                            <div className="showcase-item-info">
                              <span className="showcase-author">{item.author}</span>
                              <span className="showcase-timestamp">{item.timestamp}</span>
                            </div>
                            <span className="showcase-type">
                              {item.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                            </span>
                          </div>
                          <h5 className="showcase-item-title">{item.title}</h5>
                          {item.content && (
                            <p className="showcase-item-preview">{item.content}</p>
                          )}
                          <div className="showcase-item-stats">
                            <span><Eye size={14} /> {item.views}</span>
                            <span><Heart size={14} /> {item.likes}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {sortedAndFilteredCommunities.length === 0 && (
            <div className="no-communities">
              <p>Nenhuma comunidade encontrada para "{searchQuery}"</p>
              <button
                className="clear-search-button"
                onClick={() => setSearchQuery('')}
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default CommunitiesPage;
