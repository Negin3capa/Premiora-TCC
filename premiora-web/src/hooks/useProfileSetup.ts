import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

/**
 * Estado de validação do username
 */
export interface UsernameValidationState {
  isValid: boolean;
  isAvailable: boolean;
  isChecking: boolean;
  error: string | null;
}

/**
 * Hook customizado para gerenciar a lógica de setup de perfil
 * Inclui validação de username, persistência de dados e estados de UI
 */
export const useProfileSetup = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Estado de validação do username
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidationState>({
    isValid: false,
    isAvailable: false,
    isChecking: false,
    error: null,
  });

  /**
   * Valida o formato do username usando regex
   * @param username - Username a validar
   * @returns true se válido, false caso contrário
   */
  const validateUsernameFormat = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;
    return usernameRegex.test(username);
  };

  /**
   * Verifica disponibilidade do username no Supabase
   * @param username - Username a verificar
   * @returns Promise que resolve com true se disponível
   */
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando disponibilidade do username:', username);

      const { data, error } = await supabase
        .rpc('check_username_availability', { check_username: username });

      if (error) {
        console.error('❌ Erro ao verificar username:', error);
        throw error;
      }

      const isAvailable = data;
      console.log(isAvailable ? '✅ Username disponível' : '❌ Username já em uso', username);
      return isAvailable;
    } catch (error) {
      console.error('💥 Erro geral ao verificar username:', error);
      throw error;
    }
  };

  /**
   * Valida username completo (formato + disponibilidade)
   * @param username - Username a validar
   */
  const validateUsername = async (username: string) => {
    // Reset estado
    setUsernameValidation(prev => ({
      ...prev,
      isChecking: true,
      error: null,
    }));

    try {
      // Validar formato
      const isValidFormat = validateUsernameFormat(username);

      if (!isValidFormat) {
        setUsernameValidation({
          isValid: false,
          isAvailable: false,
          isChecking: false,
          error: 'Username deve ter 3-20 caracteres e conter apenas letras, números, pontos e underscores.',
        });
        return;
      }

      // Verificar disponibilidade
      const isAvailable = await checkUsernameAvailability(username);

      setUsernameValidation({
        isValid: true,
        isAvailable,
        isChecking: false,
        error: isAvailable ? null : 'Este username já está em uso.',
      });
    } catch (error) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        isChecking: false,
        error: 'Erro ao verificar username. Tente novamente.',
      });
    }
  };

  /**
   * Salva o perfil do usuário no Supabase
   * Para usuários OAuth, atualiza o registro existente
   * @returns Promise que resolve quando o perfil é salvo
   */
  const saveProfile = async (): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (!name.trim()) {
      throw new Error('Nome é obrigatório');
    }

    if (!usernameValidation.isValid || !usernameValidation.isAvailable) {
      throw new Error('Username inválido ou já em uso');
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('💾 Salvando perfil do usuário:', {
        userId: user.id,
        name: name.trim(),
        username: username.trim(),
      });

      // Para usuários OAuth que já têm um registro básico criado no callback,
      // fazemos UPDATE dos campos name e username
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          username: username.trim(),
          profile_setup_completed: true, // Marcar setup como completo
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        throw new Error('Erro ao salvar perfil. Tente novamente.');
      }

      console.log('✅ Perfil salvo com sucesso');

      // Atualizar perfil no contexto
      await refreshUserProfile();

      setSubmitSuccess(true);

      // Reset após sucesso
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verifica se o perfil está completo
   * @returns true se name e username estão definidos
   */
  const isProfileComplete = (): boolean => {
    return !!(userProfile?.name && userProfile?.username);
  };

  // Efeito para validar username quando muda
  useEffect(() => {
    if (username.trim()) {
      const timeoutId = setTimeout(() => {
        validateUsername(username.trim());
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        isChecking: false,
        error: null,
      });
    }
  }, [username]);

  return {
    // Estados
    name,
    setName,
    username,
    setUsername,
    isSubmitting,
    submitError,
    submitSuccess,
    usernameValidation,

    // Funções
    saveProfile,
    isProfileComplete,
    validateUsername,
  };
};
