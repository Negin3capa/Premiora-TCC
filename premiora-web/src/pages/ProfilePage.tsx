import React from 'react';
import { ProfileBanner, FeaturedPost, RecentPosts } from '../components/profile';
import { Sidebar, Header } from '../components/layout';
import type { CreatorProfile, Post } from '../types/profile';
import '../styles/globals.css';

/**
 * Página de perfil do criador
 * Exibe informações do perfil, post em destaque e lista de posts recentes
 *
 * @component
 */
const ProfilePage: React.FC = () => {
  // Mock data para o perfil do criador
  const creatorProfile: CreatorProfile = {
    name: 'Kurzgesagt',
    totalPosts: 476,
    description: 'We make videos explaining things with optimistic nihilism. We’re a small team funded by over 10 million patrons. Thank you for supporting us!',
  };

  // Mock data para o post em destaque
  const featuredPost: Post = {
    id: 'featured-1',
    title: 'The Egg - A Short Story',
    description: 'A mind-bending short story about existence, consciousness, and the universe. One of our most popular videos that explores deep philosophical questions.',
    thumbnailUrl: 'placeholder',
    createdAt: '2024-01-15T10:00:00Z',
    views: 45000000,
    likes: 1200000,
    comments: 89000,
  };

  // Mock data para posts recentes
  const recentPosts: Post[] = [
    {
      id: '1',
      title: 'Why Are We Afraid of the Dark?',
      thumbnailUrl: 'placeholder',
      createdAt: '2024-03-10T14:30:00Z',
      views: 2500000,
      comments: 15000,
    },
    {
      id: '2',
      title: 'The Universe in 4K',
      thumbnailUrl: 'placeholder',
      createdAt: '2024-03-05T09:15:00Z',
      views: 1800000,
      likes: 95000,
      comments: 12000,
    },
    {
      id: '3',
      title: 'What Happens If You Destroy a Black Hole?',
      thumbnailUrl: 'placeholder',
      createdAt: '2024-02-28T16:45:00Z',
      views: 3200000,
      likes: 180000,
      comments: 22000,
      locked: true,
    },
    {
      id: '4',
      title: 'The Day the Dinosaurs Died',
      thumbnailUrl: 'placeholder',
      createdAt: '2024-02-20T11:20:00Z',
      views: 4100000,
      likes: 210000,
      comments: 28000,
    },
    {
      id: '5',
      title: 'How to Destroy the Universe',
      thumbnailUrl: 'placeholder',
      createdAt: '2024-02-15T13:10:00Z',
      views: 2900000,
      likes: 165000,
      comments: 19500,
    },
    {
      id: '6',
      title: 'The Most Efficient Way to Destroy the Universe',
      thumbnailUrl: 'placeholder',
      createdAt: '2024-02-10T08:30:00Z',
      views: 3500000,
      likes: 195000,
      comments: 24000,
      locked: true,
    },
  ];

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
