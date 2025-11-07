/**
 * Hook para gerenciar estado de edição de perfil
 * Controla mudanças pendentes, validação e operações de salvar/cancelar
 */
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { ProfileService } from '../services/auth/ProfileService';
import { FileUploadService } from '../services/content/FileUploadService';
import type { CreatorProfile } from '../types/profile';

/**
 * Estado de edição do perfil
 */
interface ProfileEditState {
  /** Dados originais do perfil (backup) */
  originalProfile: CreatorProfile | null;
  /** Dados atuais sendo editados */
  currentProfile: CreatorProfile | null;
  /** Indica se há mudanças pendentes */
  hasChanges: boolean;
  /** Indica se está salvando */
  isSaving: boolean;
  /** Indica se está fazendo upload de imagem */
  isUploading: boolean;
  /** Erro atual */
  error: string | null;
}

/**
 * Hook para edição de perfil com preview interativo
 */
export const useProfileEdit = (initialProfile: CreatorProfile | null) => {
  const { userProfile } = useAuth();

  const [state, setState] = useState<ProfileEditState>({
    originalProfile: null,
    currentProfile: null,
    hasChanges: false,
    isSaving: false,
    isUploading: false,
    error: null
  });

  /**
   * Inicializa o estado de edição com dados do perfil
   */
  useEffect(() => {
    if (initialProfile) {
      const profileCopy = JSON.parse(JSON.stringify(initialProfile)); // Deep copy
      setState(prev => ({
        ...prev,
        originalProfile: profileCopy,
        currentProfile: profileCopy,
        hasChanges: false,
        error: null
      }));
    }
  }, [initialProfile]);

  /**
   * Verifica se há mudanças entre perfil original e atual
   */
  const checkForChanges = useCallback((original: CreatorProfile | null, current: CreatorProfile | null): boolean => {
    if (!original || !current) return false;

    return (
      original.name !== current.name ||
      original.description !== current.description ||
      original.avatar_url !== current.avatar_url ||
      original.bannerImage !== current.bannerImage
    );
  }, []);

  /**
   * Atualiza nome do perfil
   */
  const updateName = useCallback((name: string) => {
    setState(prev => {
      if (!prev.currentProfile) return prev;

      const updatedProfile = { ...prev.currentProfile, name };
      const hasChanges = checkForChanges(prev.originalProfile, updatedProfile);

      return {
        ...prev,
        currentProfile: updatedProfile,
        hasChanges
      };
    });
  }, [checkForChanges]);

  /**
   * Atualiza descrição do perfil
   */
  const updateDescription = useCallback((description: string) => {
    setState(prev => {
      if (!prev.currentProfile) return prev;

      const updatedProfile = { ...prev.currentProfile, description };
      const hasChanges = checkForChanges(prev.originalProfile, updatedProfile);

      return {
        ...prev,
        currentProfile: updatedProfile,
        hasChanges
      };
    });
  }, [checkForChanges]);

  /**
   * Faz upload e atualiza avatar
   */
  const updateAvatar = useCallback(async (imageFile: File) => {
    if (!userProfile?.id) return;

    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      // Upload da imagem
      const uploadResult = await FileUploadService.uploadFile(imageFile, 'posts', userProfile.id);

      // Atualizar perfil no banco
      await ProfileService.updateUserProfile(userProfile.id, {
        avatar_url: uploadResult.url
      });

      // Atualizar estado local
      setState(prev => {
        if (!prev.currentProfile) return prev;

        const updatedProfile = { ...prev.currentProfile, avatar_url: uploadResult.url };
        const hasChanges = checkForChanges(prev.originalProfile, updatedProfile);

        return {
          ...prev,
          currentProfile: updatedProfile,
          hasChanges,
          isUploading: false
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Erro ao atualizar avatar. Tente novamente.'
      }));
    }
  }, [userProfile?.id, checkForChanges]);

  /**
   * Faz upload e atualiza banner
   */
  const updateBanner = useCallback(async (imageFile: File) => {
    if (!userProfile?.id) return;

    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      // Upload da imagem
      const uploadResult = await FileUploadService.uploadFile(imageFile, 'posts', userProfile.id);

      // Atualizar banner no creator
      await ProfileService.updateProfileBanner(userProfile.id, uploadResult.url);

      // Atualizar estado local
      setState(prev => {
        if (!prev.currentProfile) return prev;

        const updatedProfile = { ...prev.currentProfile, bannerImage: uploadResult.url };
        const hasChanges = checkForChanges(prev.originalProfile, updatedProfile);

        return {
          ...prev,
          currentProfile: updatedProfile,
          hasChanges,
          isUploading: false
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Erro ao atualizar banner. Tente novamente.'
      }));
    }
  }, [userProfile?.id, checkForChanges]);

  /**
   * Salva todas as mudanças pendentes
   */
  const saveChanges = useCallback(async () => {
    if (!userProfile?.id || !state.currentProfile || !state.hasChanges) return;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const updates: any[] = [];

      // Atualizar nome de exibição (display_name) se mudou
      if (state.originalProfile?.name !== state.currentProfile.name) {
        updates.push(
          ProfileService.updateProfileDisplayName(userProfile.id, state.currentProfile.name)
        );
      }

      // Atualizar descrição/bio se mudou
      if (state.originalProfile?.description !== state.currentProfile.description) {
        updates.push(
          ProfileService.updateProfileBio(userProfile.id, state.currentProfile.description || '')
        );
      }

      // Executar todas as atualizações
      await Promise.all(updates);

      // Atualizar estado - mudanças salvas tornam-se originais
      setState(prev => ({
        ...prev,
        originalProfile: JSON.parse(JSON.stringify(prev.currentProfile)),
        hasChanges: false,
        isSaving: false
      }));

    } catch (error) {
      console.error('Erro ao salvar mudanças:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: 'Erro ao salvar mudanças. Tente novamente.'
      }));
    }
  }, [userProfile?.id, state.currentProfile, state.originalProfile, state.hasChanges]);

  /**
   * Cancela todas as mudanças pendentes e reverte para estado original
   */
  const cancelChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentProfile: prev.originalProfile ? JSON.parse(JSON.stringify(prev.originalProfile)) : null,
      hasChanges: false,
      error: null
    }));
  }, []);

  /**
   * Limpa erro atual
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    profile: state.currentProfile,
    hasChanges: state.hasChanges,
    isSaving: state.isSaving,
    isUploading: state.isUploading,
    error: state.error,

    // Ações
    updateName,
    updateDescription,
    updateAvatar,
    updateBanner,
    saveChanges,
    cancelChanges,
    clearError
  };
};
