/**
 * Página de comunidade individual
 * Exibe posts, informações e funcionalidades de uma comunidade específica
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ContentItem, Community } from '../types/content';
import { Sidebar, Header } from '../components/layout';
import Feed from '../components/content/Feed';
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

  // Mock data generator for community posts
  const generateMockCommunityContent = useCallback((startIndex: number, count: number): ContentItem[] => {
    const types: ContentItem['type'][] = ['post', 'video'];
    const accessLevels: ContentItem['accessLevel'][] = ['public', 'supporters', 'premium'];
    const mockItems: ContentItem[] = [];

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const type = types[Math.floor(Math.random() * types.length)];
      const accessLevel = type === 'post' ? accessLevels[Math.floor(Math.random() * accessLevels.length)] : undefined;

      const baseContent = type === 'post'
        ? `Este é um conteúdo da comunidade ${communityName}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
        : undefined;

      mockItems.push({
        id: `community-item-${index}`,
        type,
        title: type === 'video' ? `Vídeo ${index} da comunidade` : `Post ${index} da comunidade`,
        author: `Usuário ${index}`,
        authorAvatar: `/placeholder.svg?height=40&width=40`,
        thumbnail: type === 'video' ? `/placeholder.svg?height=200&width=300` : undefined,
        content: baseContent,
        views: Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 500),
        timestamp: `${Math.floor(Math.random() * 24)}h atrás`,
        // Community-specific properties
        communityId: community?.id || 'mock-community-id',
        communityName: communityName || 'comunidade-teste',
        communityAvatar: community?.avatarUrl || '/placeholder.svg?height=40&width=40',
        // Propriedades de acesso para posts
        accessLevel,
        isLocked: accessLevel !== 'public' && Math.random() > 0.5,
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
    if (!communityName) return;

    // Mock community data - in real app, this would come from API
    const mockCommunity: Community = {
      id: `community-${communityName}`,
      name: communityName,
      displayName: `Comunidade ${communityName.charAt(0).toUpperCase() + communityName.slice(1)}`,
      description: `Bem-vindo à comunidade ${communityName}! Esta é uma comunidade dedicada a discussões e compartilhamento de conteúdo relacionado a ${communityName}.`,
      bannerUrl: '/placeholder.svg?height=200&width=800',
      avatarUrl: '/placeholder.svg?height=80&width=80',
      creatorId: 'creator-123',
      isPrivate: false,
      memberCount: Math.floor(Math.random() * 10000) + 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    setCommunity(mockCommunity);
    setIsJoined(Math.random() > 0.5); // Mock join status
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
        <Sidebar />
        <div className="main-content">
          <div className="loading">Carregando comunidade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <Sidebar />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />

        {/* Community Header Banner */}
        <div className="community-header-banner">
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
                  <span className="metric-number">{Math.floor(Math.random() * 100)}</span>
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
    </div>
  );
};

export default CommunityPage;
