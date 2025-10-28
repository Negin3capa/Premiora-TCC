import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import PostFeed from './PostFeed.tsx';
import VideoSection from './VideoSection.tsx';
import CreatorsSection from './CreatorsSection.tsx';
import LiveStreamsSection from './LiveStreamsSection.tsx';
import { supabase } from '../utils/supabaseClient';

// Tipos para os dados
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  views: number;
}

interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  description: string;
}

interface LiveStream {
  id: string;
  title: string;
  streamer: string;
  thumbnail: string;
  viewers: number;
  isLive: boolean;
}

// Componente Home: Página principal com feed de conteúdo
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'feed' | 'videos' | 'creators' | 'streams'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados mock diretamente para desenvolvimento
  useEffect(() => {
    // Dados mock para desenvolvimento
    setPosts([
      { id: '1', title: 'Bem-vindo à Premiora!', content: 'Conteúdo incrível esperando por você...', author: 'Premiora Team', created_at: new Date().toISOString(), likes: 42 },
      { id: '2', title: 'Novo vídeo disponível', content: 'Assista ao nosso último tutorial...', author: 'Criador Exemplo', created_at: new Date().toISOString(), likes: 28 }
    ]);
    setVideos([
      { id: '1', title: 'Tutorial React', thumbnail: '/placeholder-video.jpg', author: 'Dev Master', views: 15420 },
      { id: '2', title: 'Design UI/UX', thumbnail: '/placeholder-video.jpg', author: 'Designer Pro', views: 8920 }
    ]);
    setCreators([
      { id: '1', name: 'João Silva', avatar: '/placeholder-avatar.jpg', followers: 15420, description: 'Desenvolvedor Full Stack' },
      { id: '2', name: 'Maria Santos', avatar: '/placeholder-avatar.jpg', followers: 8920, description: 'Designer UX/UI' }
    ]);
    setStreams([
      { id: '1', title: 'Live Coding React', streamer: 'João Silva', thumbnail: '/placeholder-stream.jpg', viewers: 234, isLive: true },
      { id: '2', title: 'Q&A Design', streamer: 'Maria Santos', thumbnail: '/placeholder-stream.jpg', viewers: 156, isLive: true }
    ]);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'feed':
        return <PostFeed posts={posts} loading={loading} />;
      case 'videos':
        return <VideoSection videos={videos} loading={loading} />;
      case 'creators':
        return <CreatorsSection creators={creators} loading={loading} />;
      case 'streams':
        return <LiveStreamsSection streams={streams} loading={loading} />;
      default:
        return <PostFeed posts={posts} loading={loading} />;
    }
  };

  return React.createElement('div', { className: 'home-page' },
    React.createElement(Navbar, { onLogout: handleLogout }),
    React.createElement('div', { className: 'home-content' },
      React.createElement('aside', { className: 'sidebar' },
        React.createElement('nav', { className: 'sidebar-nav' },
          React.createElement('button',
            {
              className: `sidebar-button ${activeSection === 'feed' ? 'active' : ''}`,
              onClick: () => setActiveSection('feed')
            },
            '📄 Feed'
          ),
          React.createElement('button',
            {
              className: `sidebar-button ${activeSection === 'videos' ? 'active' : ''}`,
              onClick: () => setActiveSection('videos')
            },
            '🎥 Vídeos'
          ),
          React.createElement('button',
            {
              className: `sidebar-button ${activeSection === 'creators' ? 'active' : ''}`,
              onClick: () => setActiveSection('creators')
            },
            '👥 Criadores'
          ),
          React.createElement('button',
            {
              className: `sidebar-button ${activeSection === 'streams' ? 'active' : ''}`,
              onClick: () => setActiveSection('streams')
            },
            '🔴 Ao Vivo'
          )
        )
      ),
      React.createElement('main', { className: 'main-content' },
        renderActiveSection()
      )
    )
  );
};

export default Home;
