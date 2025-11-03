/**
 * Página de comunidade individual
 * Exibe posts, informações e funcionalidades de uma comunidade específica
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Community } from '../types/community';
import type { ContentItem } from '../types/content';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import Feed from '../components/content/Feed';
import { getCommunityByName, isCommunityMember } from '../utils/communityUtils';
import '../styles/CommunityPage.css';

/**
 * Página de visualização de comunidade
 * Similar ao Reddit, exibe posts e informações da comunidade
 */
const CommunityPage: React.FC = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Handler para alternar visibilidade da sidebar em dispositivos móveis
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Mock data generator for community posts
  const generateMockCommunityContent = useCallback((startIndex: number, count: number): ContentItem[] => {
    const types: ContentItem['type'][] = ['post', 'video'];
    const accessLevels: ContentItem['accessLevel'][] = ['public', 'supporters', 'premium'];

    // Array de avatares para posts da comunidade
    const postAvatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face&auto=format'
    ];

    // Array de thumbnails para vídeos da comunidade
    const videoThumbnails = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop&auto=format'
    ];

    // Array de timestamps estáveis
    const timestamps = ['2h atrás', '5h atrás', '8h atrás', '12h atrás', '1d atrás', '2d atrás', '3d atrás'];

    const mockItems: ContentItem[] = [];

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      // Use index-based selection for stable values instead of random
      const type = types[index % types.length];
      const accessLevel = type === 'post' ? accessLevels[index % accessLevels.length] : undefined;

      const baseContent = type === 'post'
        ? `Este é um conteúdo da comunidade ${communityName}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
        : undefined;

      mockItems.push({
        id: `community-item-${index}`,
        type,
        title: type === 'video' ? `Vídeo ${index} da comunidade` : `Post ${index} da comunidade`,
        author: `Usuário ${index}`,
        authorAvatar: postAvatars[index % postAvatars.length],
        thumbnail: type === 'video' ? videoThumbnails[index % videoThumbnails.length] : undefined,
        content: baseContent,
        // Use stable values based on index instead of random
        views: (index + 1) * 127, // 127, 254, 381, etc.
        likes: (index + 1) * 23,  // 23, 46, 69, etc.
        timestamp: timestamps[index % timestamps.length],
        // Community-specific properties
        communityId: community?.id || 'mock-community-id',
        communityName: communityName || 'comunidade-teste',
        communityAvatar: community?.avatarUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=40&h=40&fit=crop&crop=center&auto=format',
        // Propriedades de acesso para posts
        accessLevel,
        isLocked: accessLevel !== 'public' && (index % 3 === 0), // Every 3rd item is locked
        previewContent: accessLevel !== 'public'
          ? `Este é um preview do conteúdo exclusivo ${index}. Veja apenas uma parte...`
          : undefined,
        requiredTier: accessLevel === 'supporters' ? 'Apoiadores' : accessLevel === 'premium' ? 'Premium' : undefined,
        fullContent: accessLevel !== 'public'
          ? `${baseContent}\n\nConteúdo completo exclusivo para ${accessLevel === 'supporters' ? 'apoiadores' : 'assinantes premium'}! Este é o conteúdo adicional que só membros podem ver. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
          : undefined
      });
    }

    return mockItems;
  }, [communityName, community]);

  // Load community data
  useEffect(() => {
    const loadCommunityData = async () => {
      if (!communityName) return;

      try {
        // Try to fetch real community data first
        const realCommunity = await getCommunityByName(communityName);

        if (realCommunity) {
          setCommunity(realCommunity);
          // Check if user is a member
          const isMember = await isCommunityMember(realCommunity.id);
          setIsJoined(isMember);
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar comunidade real:', error);
      }

      // Fallback to mock data if real community doesn't exist
      const getCommunityBanner = (name: string) => {
        const bannerMap: Record<string, string> = {
          tecnologia: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=200&fit=crop&auto=format',
          'arte-digital': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=200&fit=crop&auto=format',
          gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=200&fit=crop&auto=format',
          musica: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=200&fit=crop&auto=format',
          fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=200&fit=crop&auto=format',
          fotografia: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=200&fit=crop&auto=format',
          culinaria: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=200&fit=crop&auto=format',
          design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=200&fit=crop&auto=format'
        };
        return bannerMap[name] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop&auto=format';
      };

      const getCommunityAvatar = (name: string) => {
        const avatarMap: Record<string, string> = {
          tecnologia: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=80&h=80&fit=crop&crop=center&auto=format',
          'arte-digital': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop&crop=center&auto=format',
          gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop&crop=center&auto=format',
          musica: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop&crop=center&auto=format',
          fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop&crop=center&auto=format',
          fotografia: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=80&h=80&fit=crop&crop=center&auto=format',
          culinaria: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop&crop=center&auto=format',
          design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=80&h=80&fit=crop&crop=center&auto=format'
        };
        return avatarMap[name] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop&crop=center&auto=format';
      };

      // Mock community data for non-existent communities
      const mockCommunity: Community = {
        id: `community-${communityName}`,
        name: communityName,
        displayName: `Comunidade ${communityName.charAt(0).toUpperCase() + communityName.slice(1)}`,
        description: `Bem-vindo à comunidade ${communityName}! Esta é uma comunidade dedicada a discussões e compartilhamento de conteúdo relacionado a ${communityName}.`,
        bannerUrl: getCommunityBanner(communityName),
        avatarUrl: getCommunityAvatar(communityName),
        creatorId: 'creator-123',
        isPrivate: false,
        memberCount: Math.floor(Math.random() * 10000) + 1000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      setCommunity(mockCommunity);
      setIsJoined(Math.random() > 0.5); // Mock join status for mock communities
    };

    loadCommunityData();
  }, [communityName]);

  // Load initial content
  useEffect(() => {
    if (!community) return;

    setLoading(true);
    const initialContent = generateMockCommunityContent(0, 10);
    setFeedItems(initialContent);
    setLoading(false);
  }, [community, generateMockCommunityContent]);

  // Load more content for infinite scroll
  const loadMoreContent = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const newContent = generateMockCommunityContent(feedItems.length, 10);
      setFeedItems(prev => [...prev, ...newContent]);
      setPage(prev => prev + 1);

      // Simulate end of content after 5 pages
      if (page >= 5) {
        setHasMore(false);
      }

      setLoading(false);
    }, 1000);
  }, [loading, hasMore, feedItems.length, page, generateMockCommunityContent]);

  // Filter content based on search
  const filteredItems = feedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle join/leave community
  const handleJoinCommunity = () => {
    setIsJoined(!isJoined);
    // In real app, this would call an API
  };

  if (!community) {
    return (
      <div className="community-page">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <div className="loading">Carregando comunidade...</div>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  return (
    <div className="community-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onToggleSidebar={toggleSidebar}
        />

        {/* Community Header Banner */}
        <div
          className="community-header-banner"
          style={{
            backgroundImage: community.bannerUrl ? `url(${community.bannerUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="community-header-content">
            <div className="community-info-section">
              <img
                src={community.avatarUrl}
                alt={community.displayName}
                className="community-header-avatar"
              />
              <div>
                <h1 className="community-title">{community.displayName}</h1>
                <p className="community-tagline">r/{community.name}</p>
              </div>
            </div>
            <div className="community-header-actions">
              <button
                className={`join-button ${isJoined ? 'joined' : ''}`}
                onClick={handleJoinCommunity}
              >
                {isJoined ? 'Membro' : 'Participar'}
              </button>
              <button className="notification-button" title="Notificações">
                🔔
              </button>
            </div>
          </div>
        </div>



        {/* Main Community Layout */}
        <div className="community-layout">
          <div className="community-main-content">
            {/* Community Highlights */}
            <div className="community-highlights">
              <div className="highlights-header">
                <span className="highlights-icon">📌</span>
                Destaques da comunidade
                <button className="expand-button">▼</button>
              </div>
              {/* Highlighted posts would go here */}
            </div>

            {/* Sort Controls */}
            <div className="sort-controls">
              <button className="sort-button active">
                <span>🔥</span>
                Quente
              </button>
              <button className="sort-button">
                <span>🆕</span>
                Novo
              </button>
              <button className="sort-button">
                <span>⬆️</span>
                Mais votado
              </button>
              <button className="sort-button">
                <span>💬</span>
                Comentado
              </button>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
              <Feed
                items={filteredItems}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMoreContent}
              />
            </div>
          </div>

          {/* Community Sidebar */}
          <div className="community-sidebar">
            {/* Community Info Card */}
            <div className="sidebar-section community-info-card">
              <h3 className="sidebar-title">Sobre a comunidade</h3>
              <p className="community-description">{community.description}</p>

              <div className="community-stats">
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <span>{community.memberCount.toLocaleString()} membros</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📅</span>
                  <span>Criada em {new Date(community.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="community-metrics">
                <div className="metric">
                  <span className="metric-number">{Math.floor(community.memberCount * 0.05)}</span>
                  <span className="metric-label">Online</span>
                </div>
                <div className="metric">
                  <span className="metric-number">{Math.floor(community.memberCount / 30)}</span>
                  <span className="metric-label">Hoje</span>
                </div>
                <div className="metric">
                  <span className="metric-number">{Math.floor(community.memberCount / 7)}</span>
                  <span className="metric-label">Esta semana</span>
                </div>
              </div>
            </div>

            {/* User Flair Section */}
            <div className="sidebar-section user-flair-section">
              <h4 className="sidebar-subtitle">Seu flair nesta comunidade</h4>
              <div className="user-flair-preview">
                <span className="flair-icon">🏷️</span>
                <span className="flair-text">Nenhum flair definido</span>
                <span className="flair-badge">Editar</span>
              </div>
            </div>

            {/* Rules Section */}
            <div className="sidebar-section rules-section">
              <h4 className="sidebar-subtitle">Regras da comunidade</h4>
              <div className="rule-item">
                <div className="rule-header">
                  <span className="rule-number">1</span>
                  <span className="rule-title">Seja respeitoso</span>
                  <span className="rule-toggle">▼</span>
                </div>
                <div className="rule-content">
                  Trate todos os membros com respeito. Não toleramos assédio, discriminação ou conteúdo ofensivo.
                </div>
              </div>
              <div className="rule-item">
                <div className="rule-header">
                  <span className="rule-number">2</span>
                  <span className="rule-title">Conteúdo relevante</span>
                  <span className="rule-toggle">▼</span>
                </div>
                <div className="rule-content">
                  Mantenha as discussões relevantes ao tema da comunidade. Posts off-topic podem ser removidos.
                </div>
              </div>
              <div className="rule-item">
                <div className="rule-header">
                  <span className="rule-number">3</span>
                  <span className="rule-title">Sem spam</span>
                  <span className="rule-toggle">▼</span>
                </div>
                <div className="rule-content">
                  Evite postar repetidamente ou promover conteúdo comercial sem relevância.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default CommunityPage;
