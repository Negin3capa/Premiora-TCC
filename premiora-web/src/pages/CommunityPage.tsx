/**
 * Página de comunidade individual
 * Exibe posts, informações e funcionalidades de uma comunidade específica
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Community, UserFlair } from '../types/community';
import type { ContentItem, SortOption, TimeRange } from '../types/content';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import Feed from '../components/content/Feed';
import { getCommunityByName, isCommunityMember, joinCommunity, leaveCommunity, getPinnedPosts, getUserCommunityFlair } from '../utils/communityUtils';
import EditUserFlairModal from '../components/modals/EditUserFlairModal';
import { FeedService } from '../services/content/FeedService';
import { ContentTransformer } from '../services/content/ContentTransformer';
import { CommunityMetricsService, type CommunityMetrics } from '../services/community/CommunityMetricsService';
import { supabase } from '../utils/supabaseClient';
import ContentCard from '../components/ContentCard';
import {
  Bell,
  Pin,
  Flame,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  MessageSquare
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
  const [pinnedPosts, setPinnedPosts] = useState<ContentItem[]>([]);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    onlineCount: 0,
    activeToday: 0,
    activeWeek: 0,
    totalPosts: 0,
    newMembersWeek: 0
  });
  const [isFlairModalOpen, setIsFlairModalOpen] = useState(false);
  const [currentUserFlair, setCurrentUserFlair] = useState<UserFlair | null>(null);



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
        const result = await FeedService.getCommunityPostsCursor(
          communityName, 
          null, 
          10, 
          undefined, 
          sortBy, 
          timeRange
        );
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
  }, [community, communityName, sortBy, timeRange]);

  // Load pinned posts
  useEffect(() => {
    const loadPinnedPosts = async () => {
      if (!communityName) return;
      
      try {
        const posts = await getPinnedPosts(communityName);
        const transformedPosts = posts.map(post => 
          ContentTransformer.transformToContentItem(post)
        );
        setPinnedPosts(transformedPosts);
      } catch (error) {
        console.error('Erro ao carregar posts fixados:', error);
      }
    };

    loadPinnedPosts();
  }, [communityName]);

  // Track activity and load metrics
  useEffect(() => {
    if (!community?.id) return;

    const trackAndLoadMetrics = async () => {
      // Track activity if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await CommunityMetricsService.trackActivity(community.id, user.id);
      }

      // Load metrics
      const newMetrics = await CommunityMetricsService.getMetrics(community.id);
      setMetrics(newMetrics);
    };

    trackAndLoadMetrics();
    
    // Refresh metrics every minute
    const interval = setInterval(trackAndLoadMetrics, 60000);
    return () => clearInterval(interval);
  }, [community?.id]);

  // Load user flair
  useEffect(() => {
    const loadUserFlair = async () => {
      if (community?.id && isJoined) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const flair = await getUserCommunityFlair(community.id, user.id);
          setCurrentUserFlair(flair);
        }
      } else {
        setCurrentUserFlair(null);
      }
    };
    loadUserFlair();
  }, [community?.id, isJoined]);

  const handleFlairUpdated = async () => {
    if (community?.id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const flair = await getUserCommunityFlair(community.id, user.id);
        setCurrentUserFlair(flair);
      }
    }
  };

  // Load more content for infinite scroll
  const loadMoreContent = useCallback(async () => {
    if (loading || !hasMore || !communityName) return;

    setLoading(true);
    try {
      const result = await FeedService.getCommunityPostsCursor(
        communityName, 
        nextCursor, 
        10, 
        undefined, 
        sortBy, 
        timeRange
      );
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
  }, [loading, hasMore, communityName, nextCursor, sortBy, timeRange]);

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
      <div className="community-main-content">
          <div className="community-loading">Carregando comunidade...</div>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  return (
    <div className="community-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="community-page-main-content">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
                <Bell size={16} />
              </button>
            </div>
          </div>
        </div>



        {/* Main Community Layout */}
        <div className="community-layout">
          <div className="community-main-content">
            {/* Community Highlights */}
            {pinnedPosts.length > 0 && (
              <div className="community-highlights">
                <div 
                  className="highlights-header"
                  onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="highlights-title">
                    <span className="highlights-icon"><Pin size={16} /></span>
                    Destaques da comunidade
                  </div>
                  <button className="expand-button">
                    {isHighlightsExpanded ? '▼' : '▲'}
                  </button>
                </div>
                
                {isHighlightsExpanded && (
                  <div className="highlights-content">
                    {pinnedPosts.map(post => (
                      <div key={post.id} className="pinned-post-wrapper">
                        <ContentCard item={post} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sort Controls */}
            <div className="sort-controls">
              <button 
                className={`sort-button ${sortBy === 'hot' ? 'active' : ''}`}
                onClick={() => setSortBy('hot')}
              >
                <Flame size={16} />
                Quente
              </button>
              <button 
                className={`sort-button ${sortBy === 'new' ? 'active' : ''}`}
                onClick={() => setSortBy('new')}
              >
                <Sparkles size={16} />
                Novo
              </button>
              <button 
                className={`sort-button ${sortBy === 'top' ? 'active' : ''}`}
                onClick={() => setSortBy('top')}
              >
                <TrendingUp size={16} />
                Mais votado
              </button>
              
              {sortBy === 'top' && (
                <select 
                  className="time-range-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                >
                  <option value="all">Todos os tempos</option>
                  <option value="year">Este ano</option>
                  <option value="month">Este mês</option>
                  <option value="week">Esta semana</option>
                  <option value="day">Hoje</option>
                </select>
              )}
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
                showSidebar={false}
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
                  <span className="stat-icon"><MessageSquare size={14} /></span>
                  <span>{metrics.totalPosts.toLocaleString()} posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><TrendingUp size={14} /></span>
                  <span>{metrics.newMembersWeek.toLocaleString()} novos esta semana</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><Calendar size={14} /></span>
                  <span>Criada em {new Date(community.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="community-metrics">
                <div className="metric">
                  <span className="metric-number">{metrics.onlineCount}</span>
                  <span className="metric-label">Online</span>
                </div>
                <div className="metric">
                  <span className="metric-number">{metrics.activeToday}</span>
                  <span className="metric-label">Hoje</span>
                </div>
                <div className="metric">
                  <span className="metric-number">{metrics.activeWeek}</span>
                  <span className="metric-label">Esta semana</span>
                </div>
              </div>
            </div>

            {/* User Flair Section */}
            <div className="sidebar-section user-flair-section">
              <h4 className="sidebar-subtitle">Seu flair nesta comunidade</h4>
              <div className="user-flair-preview">
                <span className="flair-icon"><Tag size={14} /></span>
                {currentUserFlair && currentUserFlair.flair ? (
                  <span 
                    className="flair-badge-preview"
                    style={{
                      color: currentUserFlair.flair.flairColor,
                      backgroundColor: currentUserFlair.flair.flairBackgroundColor,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {currentUserFlair.flair.flairText}
                  </span>
                ) : (
                  <span className="flair-text">Nenhum flair definido</span>
                )}
                <span 
                  className="flair-badge" 
                  onClick={() => setIsFlairModalOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  Editar
                </span>
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
      {community && (
        <EditUserFlairModal 
          isOpen={isFlairModalOpen}
          onClose={() => setIsFlairModalOpen(false)}
          communityId={community.id}
          onFlairUpdated={handleFlairUpdated}
        />
      )}
    </div>
  );
};

export default CommunityPage;
