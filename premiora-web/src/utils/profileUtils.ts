/**
 * Utilitários para gerenciamento de perfis de usuário
 * Inclui funções para verificar usernames temporários e status de configuração
 */

/**
 * Verifica se um username é temporário (gerado automaticamente)
 * Username temporário segue o padrão: temp_ + primeiros 20 caracteres do userId (sem hífens)
 *
 * @param username - Username a verificar
 * @param userId - ID do usuário para comparação
 * @returns true se o username for temporário, false caso contrário
 */
export function isTemporaryUsername(username: string | null, userId: string): boolean {
  if (!username || !userId) {
    return false;
  }

  // Padrão usado no AuthService para gerar username temporário
  const expectedTempUsername = `temp_${userId.replace(/-/g, '').substring(0, 20)}`;

  return username === expectedTempUsername;
}

/**
 * Verifica se o perfil do usuário está completo
 * Perfil é considerado completo quando:
 * - name não é null/vazio
 * - username não é null/vazio e não é temporário
 * - profile_setup_completed é true
 *
 * @param userProfile - Perfil do usuário
 * @returns true se perfil estiver completo, false caso contrário
 */
export function isProfileComplete(userProfile: any): boolean {
  if (!userProfile) {
    return false;
  }

  const hasName = userProfile.name && userProfile.name.trim().length > 0;
  const hasUsername = userProfile.username && userProfile.username.trim().length > 0;
  const hasCustomUsername = hasUsername && !isTemporaryUsername(userProfile.username, userProfile.id);
  const isSetupCompleted = userProfile.profile_setup_completed === true;

  return hasName && hasCustomUsername && isSetupCompleted;
}

/**
 * Verifica se o usuário deve ser forçado a completar o setup
 * Usuário deve ser forçado se:
 * - Está autenticado
 * - Perfil não está completo
 * - Username é temporário (ou não existe)
 *
 * @param user - Usuário autenticado
 * @param userProfile - Perfil do usuário
 * @returns true se deve forçar setup, false caso contrário
 */
export function shouldForceProfileSetup(user: any, userProfile: any): boolean {
  if (!user) {
    return false; // Não autenticado, não força setup
  }

  if (!userProfile) {
    return true; // Sem perfil, força setup
  }

  // Se perfil não está completo E username é temporário, força setup
  if (!isProfileComplete(userProfile) && isTemporaryUsername(userProfile.username, user.id)) {
    return true;
  }

  // Se não tem username ou name, força setup
  if (!userProfile.name || !userProfile.username) {
    return true;
  }

  return false;
}

/**
 * Gera uma chave única para armazenar estado de bloqueio do setup na sessão
 * @param userId - ID do usuário
 * @returns Chave para localStorage/sessionStorage
 */
export function getSetupLockKey(userId: string): string {
  return `premiora_setup_lock_${userId}`;
}

/**
 * Verifica se o setup está bloqueado para o usuário atual
 * @param userId - ID do usuário
 * @returns true se setup está bloqueado, false caso contrário
 */
export function isSetupLocked(userId: string): boolean {
  if (!userId) return false;

  try {
    const lockKey = getSetupLockKey(userId);
    const lockData = localStorage.getItem(lockKey);

    if (!lockData) return false;

    const parsed = JSON.parse(lockData);
    const now = Date.now();

    // Verificar se o lock expirou (24 horas)
    if (parsed.expiresAt && now > parsed.expiresAt) {
      localStorage.removeItem(lockKey);
      return false;
    }

    return parsed.locked === true;
  } catch (error) {
    console.error('Erro ao verificar lock do setup:', error);
    return false;
  }
}

/**
 * Define o bloqueio do setup para o usuário
 * @param userId - ID do usuário
 * @param locked - true para bloquear, false para desbloquear
 * @param expiresInHours - Horas para expiração do lock (padrão: 24)
 */
export function setSetupLock(userId: string, locked: boolean, expiresInHours: number = 24): void {
  if (!userId) return;

  try {
    const lockKey = getSetupLockKey(userId);
    const expiresAt = locked ? Date.now() + (expiresInHours * 60 * 60 * 1000) : null;

    const lockData = {
      locked,
      expiresAt,
      timestamp: Date.now()
    };

    localStorage.setItem(lockKey, JSON.stringify(lockData));
  } catch (error) {
    console.error('Erro ao definir lock do setup:', error);
  }
}

/**
 * Remove o bloqueio do setup para o usuário
 * @param userId - ID do usuário
 */
export function clearSetupLock(userId: string): void {
  if (!userId) return;

  try {
    const lockKey = getSetupLockKey(userId);
    localStorage.removeItem(lockKey);
  } catch (error) {
    console.error('Erro ao remover lock do setup:', error);
  }
}

/**
 * Limpa todos os bloqueios de setup expirados do localStorage
 * Deve ser chamado periodicamente para manter a limpeza
 */
export function clearExpiredSetupLocks(): void {
  try {
    const keys = Object.keys(localStorage);
    const setupLockKeys = keys.filter(key => key.startsWith('premiora_setup_lock_'));

    const now = Date.now();
    let clearedCount = 0;

    setupLockKeys.forEach(key => {
      try {
        const lockData = localStorage.getItem(key);
        if (lockData) {
          const parsed = JSON.parse(lockData);

          // Remover se expirou ou se não tem data de expiração
          if (!parsed.expiresAt || now > parsed.expiresAt) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        }
      } catch (error) {
        // Se não conseguir parsear, remover o item corrompido
        localStorage.removeItem(key);
        clearedCount++;
      }
    });

    if (clearedCount > 0) {
      console.log(`🧹 Limpos ${clearedCount} bloqueios de setup expirados`);
    }
  } catch (error) {
    console.error('Erro ao limpar bloqueios expirados:', error);
  }
}
