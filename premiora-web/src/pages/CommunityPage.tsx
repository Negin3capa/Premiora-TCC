/**
 * Página de comunidade individual
 * Exibe conteúdo específico de uma comunidade como no Reddit
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getCommunityByName,
  getCommunityContent,
  joinCommunity,
  leaveCommunity,
  isCommunityMember,
  getCommunityPostFlairs,
  getCommunityTags
} from '../utils/communityUtils';
import { Sidebar, Header } from '../components/layout';
import ContentCard from '../components/content/ContentCard';
import type { Community, ContentItem, PostFlair, CommunityTag } from '../types/content';
import '../styles/HomePage.css';

/**
 * Página que exibe uma comunidade específica
 * Similar às páginas r/comunidade do Reddit
 */
const CommunityPage: React.FC = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados da comunidade
  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do conteúdo
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Estados de filtros
  const [selectedFlair, setSelectedFlair] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');

  // Dados da comunidade
  const [postFlairs, setPostFlairs] = useState<PostFlair[]>([]);
  const [tags, setTags] = useState<CommunityTag[]>([]);

  // Carregar dados da comunidade
  useEffect(() => {
    if (!communityName) return;

    const loadCommunity = async () => {
      try {
        setLoading(true);
        setError(null);

        const communityData = await getCommunityByName(communityName);
        if (!communityData) {
          setError('Comunidade não encontrada');
          return;
        }

        setCommunity(communityData);

        // Verificar se usuário é membro
        if (user) {
          const memberStatus = await isCommunityMember(communityData.id);
          setIsMember(memberStatus);
        }

        // Carregar dados auxiliares
        const [flairsData, tagsData] = await Promise.all([
          getCommunityPostFlairs(communityData.id),
          getCommunityTags(communityData.id)
        ]);

        setPostFlairs(flairsData);
        setTags(tagsData);

        // Carregar conteúdo inicial
        await loadContent();

      } catch (err) {
        console.error('Erro ao carregar comunidade:', err);
        setError('Erro ao carregar comunidade');
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [communityName, user]);

  /**
   * Carrega conteúdo da comunidade
   */
  const loadContent = async () => {
    if (!community) return;

    try {
      setContentLoading(true);
      const communityContent = await getCommunityContent(community.id);

      // TODO: Converter CommunityContent para ContentItem
      // Por enquanto, mock data
      const mockContent: ContentItem[] = communityContent.map((item, index) => ({
        id: item.contentId,
        type: item.contentType === 'post' ? 'post' : 'video',
        title: `Conteúdo ${index + 1} da comunidade ${community.displayName}`,
        author: `Usuário ${index + 1}`,
        authorAvatar: `/placeholder.svg?height=40&width=40`,
        thumbnail: item.contentType === 'video' ? `/placeholder.svg?height=200&width=300` : undefined,
        content: item.contentType === 'post' ? `Este é um post de exemplo na comunidade ${community.displayName}` : undefined,
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        timestamp: `${Math.floor(Math.random() * 24)}h atrás`,
        communityId: community.id,
        communityName: community.name,
        communityAvatar: community.avatarUrl
      }));

      setContentItems(mockContent);
    } catch (err) {
      console.error('Erro ao carregar conteúdo:', err);
    } finally {
      setContentLoading(false);
    }
  };

  /**
   * Handler para juntar-se à comunidade
   */
  const handleJoinCommunity = async () => {
    if (!community || !user) return;

    try {
      setIsJoining(true);
      const success = await joinCommunity(community.id);

      if (success) {
        setIsMember(true);
        setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
      }
    } catch (err) {
      console.error('Erro ao juntar-se à comunidade:', err);
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Handler para sair da comunidade
   */
  const handleLeaveCommunity = async () => {
    if (!community || !user) return;

    try {
      setIsJoining(true);
      const success = await leaveCommunity(community.id);

      if (success) {
        setIsMember(false);
        setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null);
      }
    } catch (err) {
      console.error('Erro ao sair da comunidade:', err);
    } finally {
      setIsJoining(false);
    }
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="homepage">
        <Sidebar />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="homepage">
        <Sidebar />
        <div className="main-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>{error || 'Comunidade não encontrada'}</h2>
            <button onClick={() => navigate('/home')} style={{ marginTop: '1rem' }}>
              Voltar ao feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Sidebar />
      <div className="main-content">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          user={user}
        />

        {/* Header da comunidade */}
        <div className="community-header" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--color-border-light)'
        }}>
          {community.bannerUrl && (
            <div className="community-banner" style={{
              height: '120px',
              backgroundImage: `url(${community.bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-4)'
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {community.avatarUrl && (
              <img
                src={community.avatarUrl}
                alt={community.displayName}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-full)',
                  border: '4px solid var(--color-bg-primary)'
                }}
              />
            )}

            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                margin: 0,
                marginBottom: 'var(--space-2)'
              }}>
                {community.displayName}
              </h1>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                marginBottom: 'var(--space-2)'
              }}>
                r/{community.name}
              </p>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-tertiary)',
                margin: 0
              }}>
                {community.memberCount} membros • {community.description}
              </p>
            </div>

            {user && (
              <button
                onClick={isMember ? handleLeaveCommunity : handleJoinCommunity}
                disabled={isJoining}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: isMember ? 'var(--color-bg-primary)' : 'var(--color-primary)',
                  color: isMember ? 'var(--color-text-primary)' : 'var(--color-text-white)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  cursor: isJoining ? 'not-allowed' : 'pointer',
                  opacity: isJoining ? 0.6 : 1
                }}
              >
                {isJoining ? '...' : (isMember ? 'Membro' : 'Juntar-se')}
              </button>
            )}
          </div>
        </div>

        {/* Filtros e controles */}
        <div className="community-controls" style={{
          display: 'flex',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-light)'
        }}>
          {/* Ordenação */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginRight: 'var(--space-2)' }}>
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'hot' | 'new' | 'top')}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="hot">Quente</option>
              <option value="new">Novo</option>
              <option value="top">Top</option>
            </select>
          </div>

          {/* Filtros por flair */}
          {postFlairs.length > 0 && (
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginRight: 'var(--space-2)' }}>
                Flair:
              </label>
              <select
                value={selectedFlair}
                onChange={(e) => setSelectedFlair(e.target.value)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Todos</option>
                {postFlairs.map(flair => (
                  <option key={flair.id} value={flair.id}>{flair.text}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtros por tag */}
          {tags.length > 0 && (
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginRight: 'var(--space-2)' }}>
                Tag:
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Todas</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Feed da comunidade */}
        <div className="feed">
          <div className="feed-content">
            {contentItems.length === 0 && !contentLoading ? (
              <div className="empty-state">
                <p>Nenhum conteúdo encontrado nesta comunidade</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                  Seja o primeiro a publicar algo!
                </p>
              </div>
            ) : (
              <div className="content-grid">
                {contentItems.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {contentLoading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Carregando conteúdo...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
