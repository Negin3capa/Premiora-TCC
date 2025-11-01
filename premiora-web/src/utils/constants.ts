/**
 * Constantes da aplicação Premiora
 */

import type { Community } from '../types/content';

/**
 * Comunidades disponíveis na plataforma (dados mockados)
 * TODO: Buscar comunidades do usuário da API
 */
export const MOCK_COMMUNITIES: Community[] = [
  { id: 'general', name: 'Geral', description: 'Discussões gerais' },
  { id: 'tech', name: 'Tecnologia', description: 'Tecnologia e inovação' },
  { id: 'art', name: 'Arte', description: 'Arte e criatividade' },
  { id: 'gaming', name: 'Gaming', description: 'Jogos e entretenimento' }
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
 */
export const HCAPTCHA_CONFIG = {
  SITE_KEY: 'c710ceee-90f2-479e-a504-6d0874c62c58'
} as const;
