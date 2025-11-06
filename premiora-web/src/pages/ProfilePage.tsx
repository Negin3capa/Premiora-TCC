/**
 * Página de Perfil do Criador
 * Página completa do perfil estilo Patreon com layout responsivo
 */
import React from 'react';
import { Sidebar } from '../components/layout';
import { ProfileBanner, FeaturedPost, RecentPosts } from '../components/profile';
import type { CreatorProfile, Post } from '../types/profile';
import '../styles/ProfilePage.css';

/**
 * Página de perfil do criador com layout completo
 * Inclui banner, post em destaque, carousel de posts recentes e sidebar
 */
const ProfilePage: React.FC = () => {
  // Mock data para o perfil do criador
  const creatorProfile: CreatorProfile = {
    name: 'Kurzgesagt – In a Nutshell',
    totalPosts: 476,
    description: 'Videos explaining things with optimistic nihilism. We create animated educational content about science, philosophy, psychology, society, and much more.',
  };

  // Mock data para o post em destaque
  const featuredPost: Post = {
    id: 'featured-1',
    title: 'The Egg - A Short Story',
    description: 'A mind-bending short story about life, death, and the universe. One of our most philosophical videos yet.',
    thumbnailUrl: 'https://example.com/egg-thumbnail.jpg',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    views: 1250000,
    likes: 89000,
    comments: 3200,
  };

  // Mock data para posts recentes
  const recentPosts: Post[] = [
    {
      id: 'post-1',
      title: 'Why You Should Care About Nuclear Energy',
      thumbnailUrl: 'https://example.com/nuclear-thumbnail.jpg',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      views: 890000,
      comments: 2100,
    },
    {
      id: 'post-2',
      title: 'The Most Efficient Way to Destroy the Universe',
      thumbnailUrl: 'https://example.com/destroy-thumbnail.jpg',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      views: 1200000,
      likes: 67000,
      comments: 2800,
    },
    {
      id: 'post-3',
      title: 'What Happens If We Detonate a Nuclear Bomb In The Mariana Trench?',
      thumbnailUrl: 'https://example.com/mariana-thumbnail.jpg',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      views: 950000,
      comments: 1900,
      locked: true, // Post bloqueado para membros premium
    },
    {
      id: 'post-4',
      title: 'The Day the Dinosaurs Died',
      thumbnailUrl: 'https://example.com/dinosaurs-thumbnail.jpg',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      views: 780000,
      likes: 45000,
      comments: 1600,
    },
    {
      id: 'post-5',
      title: 'How to Destroy the Universe (for beginners)',
      thumbnailUrl: 'https://example.com/destroy-beginners-thumbnail.jpg',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
      views: 1100000,
      comments: 2400,
      locked: true,
    },
    {
      id: 'post-6',
      title: 'The Universe is Hostile to Life',
      thumbnailUrl: 'https://example.com/hostile-thumbnail.jpg',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
      views: 670000,
      likes: 38000,
      comments: 1400,
    },
  ];

  return (
    <div className="profile-page">
      {/* Sidebar sticky (apenas layout, sem navegação) */}
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="profile-main">
        {/* Banner do perfil */}
        <ProfileBanner profile={creatorProfile} />

        {/* Container das seções */}
        <div className="profile-content">
          {/* Post em destaque */}
          <FeaturedPost post={featuredPost} />

          {/* Posts recentes com carousel */}
          <RecentPosts posts={recentPosts} />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
