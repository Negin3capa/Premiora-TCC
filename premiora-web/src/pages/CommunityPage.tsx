/**
 * Página de comunidade individual
 * Exibe posts, informações e funcionalidades de uma comunidade específica
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Community } from '../types/community';
import type { ContentItem } from '../types/content';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import Feed from '../components/content/Feed';
import { getCommunityByName, isCommunityMember, joinCommunity, leaveCommunity } from '../utils/communityUtils';
import { FeedService } from '../services/content/FeedService';
import { ContentTransformer } from '../services/content/ContentTransformer';
import {
  Bell,
  Pin,
  Flame,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Users,
  Calendar,
  Tag
} from 'lucide-react';
import '../styles/CommunityPage.css';

/**
 * Página de visualização de comunidade
 * Similar ao Reddit, exibe posts e informações da comunidade
 */
const CommunityPage: React.FC = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const [searchQuery] = useState('');
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



  // Load community data
  useEffect(() => {
    const loadCommunityData = async () => {
      if (!communityName) return;

      try {
        const realCommunity = await getCommunityByName(communityName);
        if (realCommunity) {
          setCommunity(realCommunity);
          // Check if user is a member
          const isMember = await isCommunityMember(realCommunity.id);
          setIsJoined(isMember);
        }
      } catch (error) {
        console.error('Erro ao buscar comunidade:', error);
      }
    };

    loadCommunityData();
  }, [communityName]);

  // Load initial content
  useEffect(() => {
    const loadInitialContent = async () => {
      if (!community || !communityName) return;

      setLoading(true);
      try {
        const result = await FeedService.getCommunityPostsCursor(communityName, null, 10);
        const transformedItems = result.posts.map(post =>
          ContentTransformer.transformToContentItem(post)
        );
        setFeedItems(transformedItems);
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor || null);
      } catch (error) {
        console.error('Erro ao carregar posts da comunidade:', error);
        // Set empty feed if no posts are available
        setFeedItems([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitialContent();
  }, [community, communityName]);

  // Load more content for infinite scroll
  const loadMoreContent = useCallback(async () => {
    if (loading || !hasMore || !communityName) return;

    setLoading(true);
    try {
      const result = await FeedService.getCommunityPostsCursor(communityName, nextCursor, 10);
      const transformedItems = result.posts.map(post =>
        ContentTransformer.transformToContentItem(post)
      );
      setFeedItems(prev => [...prev, ...transformedItems]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor || null);
    } catch (error) {
      console.error('Erro ao carregar mais posts da comunidade:', error);
      // Stop loading more content if there's an error
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, communityName, nextCursor]);

  // Filter content based on search
  const filteredItems = feedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle join/leave community
  const handleJoinCommunity = async () => {
    if (!community) return;

    try {
      if (isJoined) {
        // Leave community
        const success = await leaveCommunity(community.id);
        if (success) {
          setIsJoined(false);
          // Update member count
          setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null);
        }
      } else {
        // Join community
        const success = await joinCommunity(community.id);
        if (success) {
          setIsJoined(true);
          // Update member count
          setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar participação na comunidade:', error);
    }
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
        <Header />

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
                <Bell size={16} />
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
                <span className="highlights-icon"><Pin size={16} /></span>
                Destaques da comunidade
                <button className="expand-button">▼</button>
              </div>
              {/* Highlighted posts would go here */}
            </div>

            {/* Sort Controls */}
            <div className="sort-controls">
              <button className="sort-button active">
                <Flame size={16} />
                Quente
              </button>
              <button className="sort-button">
                <Sparkles size={16} />
                Novo
              </button>
              <button className="sort-button">
                <TrendingUp size={16} />
                Mais votado
              </button>
              <button className="sort-button">
                <MessageCircle size={16} />
                Comentado
              </button>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
              {feedItems.length === 0 && !loading ? (
                <div className="empty-community-message">
                  <p>Esta comunidade ainda não tem posts.</p>
                  <p>Seja o primeiro a publicar algo!</p>
                </div>
              ) : (
                <Feed
                  items={filteredItems}
                  loading={loading}
                  hasMore={hasMore}
                  onLoadMore={loadMoreContent}
                />
              )}
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
                  <span className="stat-icon"><Users size={14} /></span>
                  <span>{community.memberCount.toLocaleString()} membros</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><Calendar size={14} /></span>
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
                <span className="flair-icon"><Tag size={14} /></span>
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
