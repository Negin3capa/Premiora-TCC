/**
 * Página de edição de perfil
 * Mostra um preview interativo do perfil para edição
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileBannerEditable, FeaturedPost, RecentPosts } from '../components/profile';
import { Sidebar, Header } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { useProfileEdit } from '../hooks/useProfileEdit';
import { ProfileService } from '../services/auth/ProfileService';
import { FeedService } from '../services/content/FeedService';
import { extractThumbnailUrl, isVideoMedia } from '../utils/mediaUtils';
import type { CreatorProfile, Post, PostMedia } from '../types/profile';
import '../styles/globals.css';

/**
 * Página de edição de perfil do criador
 * Permite edição interativa do perfil com preview em tempo real
 *
 * @component
 */
const ProfileEditPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hook para gerenciar edição do perfil
  const {
    profile: editedProfile,
    hasChanges,
    isSaving,
    isUploading,
    error: editError,
    updateName,
    updateDescription,
    updateAvatar,
    updateBanner,
    removeAvatar,
    removeBanner,
    saveChanges,
    cancelChanges,
    clearError
  } = useProfileEdit(creatorProfile);

  // Verificar se usuário tem permissão para editar este perfil
  const isOwnProfile = userProfile?.username === username;

  // Redirecionar se não for o próprio perfil
  useEffect(() => {
    if (username && userProfile?.username && !isOwnProfile) {
      navigate(`/u/${username}`, { replace: true });
      return;
    }
  }, [username, userProfile, isOwnProfile, navigate]);

  // Marcar que estamos na página de edição
  useEffect(() => {
    sessionStorage.setItem('previousPage', 'profile-edit');

    return () => {
      // Limpar quando sair da página
      sessionStorage.removeItem('previousPage');
    };
  }, []);

  // Se não há username na rota, redirecionar para o perfil do usuário atual
  useEffect(() => {
    if (!username && userProfile?.username) {
      navigate(`/u/${userProfile.username}/edit`, { replace: true });
      return;
    }
  }, [username, userProfile, navigate]);

  // Buscar dados do perfil - memoizado para evitar recriações desnecessárias
  const fetchProfileData = useCallback(async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados do creator
      const profileData = await ProfileService.getCreatorByUsername(username);

      if (!profileData) {
        setError('Perfil não encontrado');
        return;
      }

      setCreatorProfile(profileData);

      // Buscar posts do creator
      const postsResult = await FeedService.getCreatorPosts(profileData.user.id, 1, 20, userProfile?.id);

      if (postsResult.posts && postsResult.posts.length > 0) {
        // Converter posts para formato Post
        const formattedPosts: Post[] = postsResult.posts.map((post: any) => {
          // Extrair informações de mídia
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

        // Calcular post em destaque baseado em engajamento
        const featured = calculateFeaturedPost(formattedPosts);
        setFeaturedPost(featured);
      }

    } catch (err) {
      console.error('Erro ao buscar dados do perfil:', err);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [username, userProfile?.id]); // userProfile?.id é usado na busca de posts, então deve estar nas dependências

  // Buscar dados do perfil quando username muda
  useEffect(() => {
    fetchProfileData();
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

  /**
   * Handler para salvar mudanças
   */
  const handleSaveChanges = useCallback(async () => {
    try {
      console.log('💾 Iniciando salvamento de mudanças do perfil...');
      await saveChanges();
      console.log('✅ Mudanças salvas no banco de dados');

      // Aguardar um momento para garantir que a sincronização terminou
      await new Promise(resolve => setTimeout(resolve, 500));

      // Atualizar contexto global com busca fresca
      console.log('🔄 Atualizando contexto global com busca fresca...');
      await refreshUserProfile(true);
      console.log('✅ Contexto global atualizado');

      // Mostrar feedback de sucesso
      alert('Perfil atualizado com sucesso!');

      // Redirecionar para página normal do perfil
      console.log('🔀 Redirecionando para página do perfil...');
      navigate(`/u/${username}`);
    } catch (error) {
      console.error('❌ Erro ao salvar mudanças:', error);
      alert('Erro ao salvar mudanças. Tente novamente.');
    }
  }, [saveChanges, refreshUserProfile, navigate, username]);

  /**
   * Handler para cancelar mudanças
   */
  const handleCancelChanges = useCallback(() => {
    cancelChanges();
    // Limpar erros
    clearError();
    // Redirecionar para página normal do perfil
    navigate(`/u/${username}`);
  }, [cancelChanges, clearError, navigate, username]);

  // Mostrar loading inicial
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0D0D0D',
        minHeight: '100vh',
        color: '#DADADA',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Carregando perfil...
      </div>
    );
  }

  // Mostrar erro se não conseguir carregar
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

  // Verificar permissão
  if (!isOwnProfile) {
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
        <h2>Você não tem permissão para editar este perfil</h2>
        <button
          onClick={() => navigate(`/u/${username}`)}
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
          Voltar ao Perfil
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
      {/* Global Sidebar */}
      <Sidebar />

      {/* Global Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Profile Banner Editable - Full screen width */}
      <div style={{
        position: 'relative',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginTop: '64px', /* Account for header height */
      }}>
        <ProfileBannerEditable
          profile={editedProfile}
          isUploading={isUploading}
          onUpdateName={updateName}
          onUpdateDescription={updateDescription}
          onUpdateAvatar={updateAvatar}
          onUpdateBanner={updateBanner}
          onRemoveAvatar={removeAvatar}
          onRemoveBanner={removeBanner}
          onSave={handleSaveChanges}
          onCancel={handleCancelChanges}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />
      </div>

      {/* Main content container - adjusted for fixed sidebar and header */}
      <div style={{
        marginLeft: '80px', /* Account for sidebar width */
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
          <FeaturedPost post={featuredPost} />
          <RecentPosts posts={recentPosts} />
        </div>
      </div>

      {/* Error Display */}
      {(error || editError) && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error || editError}</span>
            <button
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProfileEditPage);
