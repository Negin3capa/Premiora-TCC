import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileBanner, FeaturedPost, RecentPosts } from '../components/profile';
import { Sidebar, Header, ProfileSidebar } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { ProfileService } from '../services/auth/ProfileService';
import { FeedService } from '../services/content/FeedService';
import { extractThumbnailUrl, isVideoMedia } from '../utils/mediaUtils';
import type { CreatorProfile, Post, PostMedia } from '../types/profile';
import '../styles/globals.css';

// Cache global para prefetch - acessível via window
declare global {
  interface Window {
    ProfilePrefetchCache?: {
      getInstance(): {
        getCachedFeed(): any[] | null;
        getCachedProfile(username: string): {
          profile: CreatorProfile | null;
          posts: Post[];
          featuredPost: Post | null;
        } | null;
      };
    };
  }
}

/**
 * Página de perfil do criador
 * Exibe informações do perfil, post em destaque e lista de posts recentes
 *
 * @component
 */
const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // TODO: Implement follow state

  // Verificar se é o próprio perfil do usuário
  const isOwnProfile = userProfile?.username === username;

  // Handlers para ações da sidebar minimalista
  const handleFollowToggle = useCallback(() => {
    setIsFollowing(prev => !prev);
    // TODO: Implementar chamada para API de follow/unfollow
    console.log(`${isFollowing ? 'Unfollowing' : 'Following'} ${username}`);
  }, [isFollowing, username]);

  const handleShare = useCallback(() => {
    // TODO: Implementar compartilhamento do perfil
    const profileUrl = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(profileUrl);
    console.log(`Sharing profile: ${profileUrl}`);
  }, [username]);

  const handleReport = useCallback(() => {
    // TODO: Implementar denúncia do perfil
    console.log(`Reporting profile: ${username}`);
  }, [username]);

  // Se não há username na rota, redirecionar para o perfil do usuário atual
  useEffect(() => {
    if (!username && userProfile?.username) {
      navigate(`/u/${userProfile.username}`, { replace: true });
      return;
    }
  }, [username, userProfile, navigate]);

  // Buscar dados do perfil - memoizado para evitar recriações desnecessárias
  const fetchProfileData = useCallback(async () => {
    if (!username) return;

    try {
      setProfileLoading(true);
      setPostsLoading(true);
      setError(null);

      // Primeiro verificar se há dados no cache de prefetch
      const cachedData = window.ProfilePrefetchCache?.getInstance().getCachedProfile(username);

      if (cachedData && cachedData.profile) {
        console.log('🎯 Usando dados do cache de prefetch!', username);
        setCreatorProfile(cachedData.profile);
        setRecentPosts(cachedData.posts);
        setFeaturedPost(cachedData.featuredPost);
        setProfileLoading(false);
        setPostsLoading(false);
        return;
      }

      // Buscar dados do creator
      const profileData = await ProfileService.getCreatorByUsername(username);

      if (!profileData) {
        setError('Perfil não encontrado');
        setProfileLoading(false);
        setPostsLoading(false);
        return;
      }

      setCreatorProfile(profileData);
      setProfileLoading(false); // Perfil carregado, mostrar layout

      // Buscar posts do creator em paralelo com o processamento
      const postsPromise = FeedService.getCreatorPosts(profileData.user.id, 1, 20, userProfile?.id);

      // Processar posts de forma assíncrona
      postsPromise.then((postsResult) => {
        if (postsResult.posts && postsResult.posts.length > 0) {
          // Converter posts para formato Post - otimizado
          const formattedPosts: Post[] = postsResult.posts.map((post: any) => {
            // Extrair informações de mídia de forma mais eficiente
            const mediaUrls: PostMedia[] = post.media_urls || [];
            const firstMedia = mediaUrls[0];
            const thumbnailUrl = firstMedia ? extractThumbnailUrl(firstMedia) || 'placeholder' : 'placeholder';
            const isVideo = firstMedia ? isVideoMedia(firstMedia) : false;

            return {
              id: post.id,
              title: post.title,
              description: post.content,
              thumbnailUrl,
              mediaUrls,
              createdAt: post.published_at,
              views: post.views || 0,
              likes: post.post_likes?.length || 0,
              comments: post.comments || 0,
              locked: post.is_premium,
              contentType: isVideo ? 'video' : (firstMedia ? 'image' : 'text')
            };
          });

          setRecentPosts(formattedPosts);

          // Calcular post em destaque de forma assíncrona para não bloquear UI
          setTimeout(() => {
            const featured = calculateFeaturedPost(formattedPosts);
            setFeaturedPost(featured);
          }, 0);
        } else {
          // Se não há posts, definir arrays vazios
          setRecentPosts([]);
          setFeaturedPost(null);
        }
        setPostsLoading(false);
      }).catch((err) => {
        console.error('Erro ao buscar posts do perfil:', err);
        // Não definir erro geral se apenas posts falharam
        setRecentPosts([]);
        setFeaturedPost(null);
        setPostsLoading(false);
      });

    } catch (err) {
      console.error('Erro ao buscar dados do perfil:', err);
      setError('Erro ao carregar perfil');
      setProfileLoading(false);
      setPostsLoading(false);
    }
  }, [username, userProfile?.id]);

  // Buscar dados do perfil quando username muda ou quando volta de edição
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Refresh automático apenas quando volta da edição (mais específico)
  useEffect(() => {
    const handleFocus = () => {
      // Verificar se acabamos de voltar da página de edição
      const previousPage = sessionStorage.getItem('previousPage');
      if (previousPage === 'profile-edit') {
        console.log('🔄 Voltando da edição - fazendo refresh do perfil');
        fetchProfileData();
        sessionStorage.removeItem('previousPage');
      }
    };

    // Usar visibilitychange em vez de focus para melhor performance
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProfileData]);

  /**
   * Calcula qual post deve ser o em destaque baseado em engajamento
   * Fórmula: (views * 1) + (likes * 2) + (comments * 3)
   */
  const calculateFeaturedPost = (posts: Post[]): Post | null => {
    if (posts.length === 0) return null;

    let bestPost = posts[0];
    let bestScore = calculateEngagementScore(bestPost);

    for (const post of posts) {
      const score = calculateEngagementScore(post);
      if (score > bestScore) {
        bestScore = score;
        bestPost = post;
      }
    }

    return bestPost;
  };

  /**
   * Calcula pontuação de engajamento de um post
   */
  const calculateEngagementScore = (post: Post): number => {
    const views = post.views || 0;
    const likes = post.likes || 0;
    const comments = post.comments || 0;

    return (views * 1) + (likes * 2) + (comments * 3);
  };

  // Se ainda está carregando o perfil, mostrar skeleton
  if (profileLoading) {
  return (
    <div style={{
      backgroundColor: '#0D0D0D',
      minHeight: '100vh',
      color: '#DADADA',
      overflowX: 'hidden'
    }}>
      {/* Show default sidebar during loading to prevent flash */}
      <Sidebar />

      {/* Global Header - default mode during loading */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isProfileMode={false}
      />

        {/* Profile Banner Skeleton */}
        <div style={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          marginTop: '64px',
          height: '300px',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            color: '#666',
            fontSize: '1.2rem'
          }}>
            Carregando perfil...
          </div>
        </div>

        {/* Main content container */}
        <div style={{
          marginLeft: '80px', /* Consistent with default sidebar width */
          marginTop: '0',
          padding: '2rem 1rem',
          overflow: 'hidden',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            overflow: 'hidden',
          }}>
            {/* Skeleton para posts */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              height: '200px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              Carregando posts...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creatorProfile) {
    return (
      <div style={{
        backgroundColor: '#0D0D0D',
        minHeight: '100vh',
        color: '#DADADA',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <h2>{error || 'Perfil não encontrado'}</h2>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0D0D0D',
      minHeight: '100vh',
      color: '#DADADA',
      overflowX: 'hidden'
    }}>
      {/* Conditional Sidebar - Full sidebar for own profile, minimal for others */}
      {isOwnProfile ? (
        <Sidebar />
      ) : (
        <ProfileSidebar
          username={username!}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          onShare={handleShare}
          onReport={handleReport}
        />
      )}

      {/* Global Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isProfileMode={!isOwnProfile}
      />

      {/* Profile Banner - Full screen width */}
      <div style={{
        position: 'relative',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginTop: '64px', /* Account for header height */
      }}>
        <ProfileBanner profile={creatorProfile} />
      </div>

      {/* Main content container - adjusted for fixed sidebar and header */}
      <div style={{
        marginLeft: isOwnProfile ? '80px' : '60px', /* Account for sidebar width */
        marginTop: '0', /* Banner now handles the top spacing */
        padding: '2rem 1rem',
        overflow: 'hidden',
      }}>
        {/* Content container */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          overflow: 'hidden',
        }}>
          {/* Só renderizar FeaturedPost se há posts ou se já foi calculado */}
          {(featuredPost || recentPosts.length > 0) && <FeaturedPost post={featuredPost} />}

          {/* Só renderizar RecentPosts se há posts */}
          {recentPosts.length > 0 && <RecentPosts posts={recentPosts} />}

          {/* Mostrar mensagem se não há posts ainda */}
          {recentPosts.length === 0 && featuredPost === null && !postsLoading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#888',
              fontSize: '1.1rem'
            }}>
              Nenhum post encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfilePage);
