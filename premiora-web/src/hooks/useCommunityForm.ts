/**
 * Hook personalizado para gerenciar formulário de criação de comunidade
 * Centraliza lógica de validação, estado e operações do formulário
 */
import { useState, useCallback } from 'react';
import { getCommunityByName } from '../utils/communityUtils';

/**
 * Dados do formulário de criação de comunidade
 */
export interface CommunityFormData {
  name: string;
  displayName: string;
  description: string;
  banner?: File | null;
  avatar?: File | null;
  isPrivate: boolean;
  tags: string[];
}

/**
 * Estado de validação do formulário
 */
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  nameAvailable: boolean | null;
  checkingName: boolean;
}

/**
 * Hook para gerenciar formulário de criação de comunidade
 */
export const useCommunityForm = () => {
  // Estado do formulário
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    displayName: '',
    description: '',
    banner: null,
    avatar: null,
    isPrivate: false,
    tags: []
  });

  // Estado de validação
  const [validation, setValidation] = useState<FormValidationState>({
    isValid: false,
    errors: {},
    nameAvailable: null,
    checkingName: false
  });

  /**
   * Atualiza campo do formulário
   */
  const updateField = useCallback((field: keyof CommunityFormData, value: string | boolean | File | null) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Verificar disponibilidade do nome quando for alterado
      if (field === 'name' && typeof value === 'string') {
        if (value.length < 3) {
          setValidation(v => ({ ...v, nameAvailable: null, checkingName: false }));
        } else {
          setValidation(v => ({ ...v, checkingName: true }));
          // Verificar disponibilidade de forma assíncrona
          getCommunityByName(value).then(existing => {
            setValidation(v => ({
              ...v,
              nameAvailable: !existing,
              checkingName: false
            }));
          }).catch(() => {
            setValidation(v => ({
              ...v,
              nameAvailable: false,
              checkingName: false
            }));
          });
        }
      }

      // Revalidar formulário após mudança
      setTimeout(() => {
        // Validação inline simplificada
        const errors: Record<string, string> = {};

        if (!newData.name.trim()) {
          errors.name = 'Nome da comunidade é obrigatório';
        } else if (newData.name.length < 3) {
          errors.name = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (!newData.displayName.trim()) {
          errors.displayName = 'Nome de exibição é obrigatório';
        } else if (newData.displayName.length < 3) {
          errors.displayName = 'Nome de exibição deve ter pelo menos 3 caracteres';
        }

        if (!newData.description.trim()) {
          errors.description = 'Descrição é obrigatória';
        } else if (newData.description.length < 10) {
          errors.description = 'Descrição deve ter pelo menos 10 caracteres';
        }

        setValidation(v => ({
          ...v,
          isValid: Object.keys(errors).length === 0,
          errors
        }));
      }, 0);

      return newData;
    });
  }, []);

  /**
   * Adiciona ou remove tag
   */
  const toggleTag = useCallback((tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags.slice(0, 4), tag]; // Máximo 5 tags

      return { ...prev, tags: newTags };
    });

    // Revalidar após mudança
    setTimeout(validateForm, 0);
  }, []);

  /**
   * Remove arquivo do banner
   */
  const removeBanner = useCallback(() => {
    setFormData(prev => ({ ...prev, banner: null }));
    // Limpar input file
    const input = document.getElementById('banner-upload') as HTMLInputElement;
    if (input) input.value = '';
  }, []);

  /**
   * Remove arquivo do avatar
   */
  const removeAvatar = useCallback(() => {
    setFormData(prev => ({ ...prev, avatar: null }));
    // Limpar input file
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    if (input) input.value = '';
  }, []);

  /**
   * Verifica disponibilidade do nome da comunidade
   */
  const checkNameAvailability = useCallback(async (name: string) => {
    if (name.length < 3) {
      setValidation(prev => ({ ...prev, nameAvailable: null, checkingName: false }));
      return;
    }

    setValidation(prev => ({ ...prev, checkingName: true }));

    try {
      const existingCommunity = await getCommunityByName(name);
      setValidation(prev => ({
        ...prev,
        nameAvailable: !existingCommunity,
        checkingName: false
      }));
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do nome:', error);
      setValidation(prev => ({
        ...prev,
        nameAvailable: false,
        checkingName: false
      }));
    }
  }, []);

  /**
   * Valida formulário
   */
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    // Validações básicas
    if (!formData.name.trim()) {
      errors.name = 'Nome da comunidade é obrigatório';
    } else if (formData.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (validation.nameAvailable === false) {
      errors.name = 'Este nome já está em uso';
    }

    if (!formData.displayName.trim()) {
      errors.displayName = 'Nome de exibição é obrigatório';
    } else if (formData.displayName.length < 3) {
      errors.displayName = 'Nome de exibição deve ter pelo menos 3 caracteres';
    }

    if (!formData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    // Validação de arquivos
    if (formData.banner && formData.banner.size > 8 * 1024 * 1024) { // 8MB
      errors.banner = 'Banner deve ter no máximo 8MB';
    }

    if (formData.avatar && formData.avatar.size > 2 * 1024 * 1024) { // 2MB
      errors.avatar = 'Avatar deve ter no máximo 2MB';
    }

    const isValid = Object.keys(errors).length === 0 &&
                   validation.nameAvailable === true &&
                   Boolean(formData.name.trim()) &&
                   Boolean(formData.displayName.trim()) &&
                   Boolean(formData.description.trim());

    setValidation(prev => ({
      ...prev,
      isValid,
      errors
    }));

    return isValid;
  }, [formData, validation.nameAvailable]);

  /**
   * Reseta formulário
   */
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      banner: null,
      avatar: null,
      isPrivate: false,
      tags: []
    });

    setValidation({
      isValid: false,
      errors: {},
      nameAvailable: null,
      checkingName: false
    });

    // Limpar inputs de arquivo
    const bannerInput = document.getElementById('banner-upload') as HTMLInputElement;
    const avatarInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (bannerInput) bannerInput.value = '';
    if (avatarInput) avatarInput.value = '';
  }, []);

  return {
    // Estado
    formData,
    validation,

    // Ações
    updateField,
    toggleTag,
    removeBanner,
    removeAvatar,
    validateForm,
    resetForm,

    // Utilitários
    checkNameAvailability
  };
};
