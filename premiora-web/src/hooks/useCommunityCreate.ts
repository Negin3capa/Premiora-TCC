/**
 * Hook personalizado para gerenciar criação de comunidades
 * Centraliza estado e lógica de criação de comunidades
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommunity } from '../utils/communityUtils';

/**
 * Interface para uma regra da comunidade
 */
interface CommunityRule {
  id: string;
  title: string;
  description: string;
  order: number;
}

/**
 * Estado da comunidade sendo criada
 */
interface CommunityCreateState {
  name: string;
  displayName: string;
  description: string;
  bannerFile: File | null;
  avatarFile: File | null;
  bannerUrl: string;
  avatarUrl: string;
  rules: CommunityRule[];
  isPrivate: boolean;
}

/**
 * Hook para criação de comunidades
 */
export const useCommunityCreate = () => {
  const navigate = useNavigate();

  // Estado inicial da comunidade
  const [state, setState] = useState<CommunityCreateState>({
    name: '',
    displayName: '',
    description: '',
    bannerFile: null,
    avatarFile: null,
    bannerUrl: '',
    avatarUrl: '',
    rules: [],
    isPrivate: false
  });

  // Estados de UI
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Verifica se há mudanças pendentes
   */
  const hasChanges = state.name.trim() !== '' ||
                    state.displayName.trim() !== '' ||
                    state.description.trim() !== '' ||
                    state.bannerFile !== null ||
                    state.avatarFile !== null ||
                    state.rules.length > 0 ||
                    state.isPrivate;

  /**
   * Atualiza o nome da comunidade
   */
  const updateName = useCallback((name: string) => {
    setState(prev => ({ ...prev, name: name.trim() }));
  }, []);

  /**
   * Atualiza o nome de exibição da comunidade
   */
  const updateDisplayName = useCallback((displayName: string) => {
    setState(prev => ({ ...prev, displayName: displayName.trim() }));
  }, []);

  /**
   * Atualiza a descrição da comunidade
   */
  const updateDescription = useCallback((description: string) => {
    setState(prev => ({ ...prev, description: description.trim() }));
  }, []);

  /**
   * Atualiza o banner da comunidade
   */
  const updateBanner = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      bannerFile: file,
      bannerUrl: url
    }));
  }, []);

  /**
   * Atualiza o avatar da comunidade
   */
  const updateAvatar = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      avatarFile: file,
      avatarUrl: url
    }));
  }, []);

  /**
   * Atualiza as regras da comunidade
   */
  const updateRules = useCallback((rules: CommunityRule[]) => {
    setState(prev => ({ ...prev, rules }));
  }, []);

  /**
   * Atualiza a configuração de privacidade
   */
  const updatePrivacy = useCallback((isPrivate: boolean) => {
    setState(prev => ({ ...prev, isPrivate }));
  }, []);

  /**
   * Valida os dados da comunidade
   */
  const validateCommunity = useCallback((): string | null => {
    if (!state.name.trim()) {
      return 'Nome da comunidade é obrigatório';
    }

    if (!state.displayName.trim()) {
      return 'Nome de exibição é obrigatório';
    }

    if (!state.description.trim()) {
      return 'Descrição da comunidade é obrigatória';
    }

    // Validar nome (apenas letras, números e underscores)
    const nameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nameRegex.test(state.name)) {
      return 'Nome da comunidade deve conter apenas letras, números e underscores';
    }

    // Validar comprimento do nome
    if (state.name.length < 3 || state.name.length > 21) {
      return 'Nome da comunidade deve ter entre 3 e 21 caracteres';
    }

    // Validar comprimento do nome de exibição
    if (state.displayName.length < 3 || state.displayName.length > 100) {
      return 'Nome de exibição deve ter entre 3 e 100 caracteres';
    }

    // Validar comprimento da descrição
    if (state.description.length < 10 || state.description.length > 500) {
      return 'Descrição deve ter entre 10 e 500 caracteres';
    }

    return null;
  }, [state]);

  /**
   * Cria a comunidade
   */
  const create = useCallback(async () => {
    // Validar dados
    const validationError = validateCommunity();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    setError(null);
    setIsUploading(true);

    try {
      // Criar comunidade usando a API
      const community = await createCommunity({
        name: state.name,
        displayName: state.displayName,
        description: state.description,
        bannerFile: state.bannerFile,
        avatarFile: state.avatarFile,
        isPrivate: state.isPrivate
      });

      if (community) {
        // Redirecionar para a comunidade recém-criada
        navigate(`/r/${community.name}`);
      } else {
        throw new Error('Falha ao criar comunidade');
      }
    } catch (err) {
      console.error('Erro ao criar comunidade:', err);

      // Tratar erros específicos
      if (err instanceof Error) {
        if (err.message.includes('duplicate') || err.message.includes('already exists') || err.message.includes('23505')) {
          setError('Nome da comunidade já está em uso. Escolha um nome diferente.');
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } else {
          setError(err.message || 'Erro desconhecido ao criar comunidade');
        }
      } else {
        setError('Erro desconhecido ao criar comunidade');
      }
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  }, [state, validateCommunity, navigate]);

  /**
   * Cancela a criação e volta para a página anterior
   */
  const cancel = useCallback(() => {
    navigate(-1); // Volta para a página anterior
  }, [navigate]);

  /**
   * Limpa o estado e erros
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reseta o estado para valores iniciais
   */
  const reset = useCallback(() => {
    setState({
      name: '',
      displayName: '',
      description: '',
      bannerFile: null,
      avatarFile: null,
      bannerUrl: '',
      avatarUrl: '',
      rules: [],
      isPrivate: false
    });
    setError(null);
  }, []);

  return {
    // Estado
    community: state,
    isCreating,
    isUploading,
    error,
    hasChanges,

    // Actions
    updateName,
    updateDisplayName,
    updateDescription,
    updateBanner,
    updateAvatar,
    updateRules,
    updatePrivacy,
    create,
    cancel,
    clearError,
    reset,

    // Utilitários
    validateCommunity
  };
};
