/**
 * Página de listagem de comunidades
 * Exibe todas as comunidades disponíveis com filtros e ordenação
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Community, ContentItem } from '../types/content';
import { Sidebar, Header } from '../components/layout';
import '../styles/CommunitiesPage.css';

/**
 * Página de comunidades que lista todas as comunidades disponíveis
 * Permite ordenação por relevância, tendência, popularidade, etc.
 */
const CommunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'trending' | 'popular' | 'new' | 'alphabetical'>('popular');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communityContent, setCommunityContent] = useState<ContentItem[]>([]);

  // Mock data generator for communities
  const generateMockCommunities = (): Community[] => {
    const mockCommunities: Community[] = [
      {
        id: 'tech-community',
        name: 'tecnologia',
        displayName: 'Tecnologia & Inovação',
        description: 'Discussões sobre as últimas tendências em tecnologia, programação, IA e inovação digital.',
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        bannerUrl: '/placeholder.svg?height=200&width=800',
        avatarUrl: '/placeholder.svg?height=80&width=80',
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
        authorAvatar: `https://ui-avatars.com/api/?name=Membro${i + 1}&background=random&color=fff`,
        thumbnail: isVideo ? `/placeholder.svg?height=200&width=300` : undefined,
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
      case 'alphabetical':
        return communitiesWithScores.sort((a, b) => a.displayName.localeCompare(b.displayName));
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
        <Sidebar />
        <div className="main-content">
          <div className="loading">Carregando comunidades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="communities-page">
      <Sidebar />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
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
                🔍 Relevância
              </button>
              <button
                className={`sort-button ${sortBy === 'trending' ? 'active' : ''}`}
                onClick={() => setSortBy('trending')}
              >
                🔥 Tendência
              </button>
              <button
                className={`sort-button ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                👥 Popular
              </button>
              <button
                className={`sort-button ${sortBy === 'new' ? 'active' : ''}`}
                onClick={() => setSortBy('new')}
              >
                🆕 Novo
              </button>
              <button
                className={`sort-button ${sortBy === 'alphabetical' ? 'active' : ''}`}
                onClick={() => setSortBy('alphabetical')}
              >
                🔤 Alfabética
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
                      👥 {community.memberCount.toLocaleString()} membros
                    </span>
                    <span className="stat">
                      📅 Criada em {new Date(community.createdAt).toLocaleDateString('pt-BR')}
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
                              {item.type === 'video' ? '🎥' : '📝'}
                            </span>
                          </div>
                          <h5 className="showcase-item-title">{item.title}</h5>
                          {item.content && (
                            <p className="showcase-item-preview">{item.content}</p>
                          )}
                          <div className="showcase-item-stats">
                            <span>👁️ {item.views}</span>
                            <span>❤️ {item.likes}</span>
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
    </div>
  );
};

export default CommunitiesPage;
