/**
 * Constantes da aplicação Premiora
 */

import type { Community } from '../types/community';

/**
 * Comunidades disponíveis na plataforma (dados mockados)
 * TODO: Buscar comunidades do usuário da API
 */
export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'general',
    name: 'geral',
    displayName: 'Geral',
    description: 'Discussões gerais',
    creatorId: 'mock-creator',
    isPrivate: false,
    memberCount: 1000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tech',
    name: 'tecnologia',
    displayName: 'Tecnologia',
    description: 'Tecnologia e inovação',
    creatorId: 'mock-creator',
    isPrivate: false,
    memberCount: 500,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'art',
    name: 'arte',
    displayName: 'Arte',
    description: 'Arte e criatividade',
    creatorId: 'mock-creator',
    isPrivate: false,
    memberCount: 300,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'gaming',
    name: 'gaming',
    displayName: 'Gaming',
    description: 'Jogos e entretenimento',
    creatorId: 'mock-creator',
    isPrivate: false,
    memberCount: 800,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * Configurações de upload de arquivo
 */
export const UPLOAD_CONFIG = {
  VIDEO: {
    MAX_SIZE_MB: 2000, // 2GB
    ACCEPTED_TYPES: 'video/*',
    DESCRIPTION: 'MP4, AVI, MOV até 2GB'
  },
  IMAGE: {
    MAX_SIZE_MB: 10,
    ACCEPTED_TYPES: 'image/*',
    DESCRIPTION: 'PNG, JPG até 10MB'
  },
  THUMBNAIL: {
    MAX_SIZE_MB: 5,
    ACCEPTED_TYPES: 'image/*',
    DESCRIPTION: 'PNG, JPG até 5MB • 1280x720 recomendado'
  }
} as const;

/**
 * Limites de caracteres para formulários
 */
export const FORM_LIMITS = {
  TITLE: 200,
  DESCRIPTION: 2000,
  POST_CONTENT: 5000
} as const;

/**
 * Configurações do hCaptcha
 * A chave do site é obtida da variável de ambiente VITE_HCAPTCHA_SITE_KEY
 */
export const HCAPTCHA_CONFIG = {
  SITE_KEY: import.meta.env.VITE_HCAPTCHA_SITE_KEY || ''
} as const;
