import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileBanner, FeaturedPost, RecentPosts } from '../components/profile';
import { Sidebar, Header } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { ProfileService } from '../services/auth/ProfileService';
import { FeedService } from '../services/content/FeedService';
import type { CreatorProfile, Post } from '../types/profile';
import '../styles/globals.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Se não há username na rota, redirecionar para o perfil do usuário atual
  useEffect(() => {
    if (!username && userProfile?.username) {
      navigate(`/u/${userProfile.username}`, { replace: true });
      return;
    }
  }, [username, userProfile, navigate]);

  // Buscar dados do perfil
  useEffect(() => {
    const fetchProfileData = async () => {
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
          const formattedPosts: Post[] = postsResult.posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            description: post.content,
            thumbnailUrl: post.media_urls?.[0] || 'placeholder',
            createdAt: post.published_at,
            views: post.views || 0,
            likes: post.post_likes?.length || 0,
            comments: post.comments || 0,
            locked: post.is_premium
          }));

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
    };

    fetchProfileData();
  }, [username, userProfile]);

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
      {/* Global Sidebar */}
      <Sidebar />

      {/* Global Header */}
      <Header />

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
    </div>
  );
};

export default ProfilePage;
