/**
 * Utilitário para geração de usernames únicos
 * Gera usernames incrementais quando há conflitos (@teste, @teste1, @teste2...)
 */
import { supabase } from './supabaseClient';

/**
 * Gera um username único baseado em uma string base
 * Se o username já existir, incrementa um número até encontrar um disponível
 *
 * @param baseUsername - String base para o username (ex: "teste")
 * @returns Promise com username único
 * @throws Error se não conseguir gerar username único após várias tentativas
 */
export async function generateUniqueUsername(baseUsername: string): Promise<string> {
  // Sanitizar a string base (remover caracteres especiais, limitar tamanho)
  const sanitizedBase = sanitizeUsername(baseUsername);

  // Tentar o username base primeiro
  const isAvailable = await checkUsernameAvailability(sanitizedBase);
  if (isAvailable) {
    return sanitizedBase;
  }

  // Se não estiver disponível, tentar incrementais
  let counter = 1;
  const maxAttempts = 100; // Limite de tentativas para evitar loop infinito

  while (counter < maxAttempts) {
    const candidateUsername = `${sanitizedBase}${counter}`;
    const isAvailable = await checkUsernameAvailability(candidateUsername);

    if (isAvailable) {
      return candidateUsername;
    }

    counter++;
  }

  // Se chegou aqui, não conseguiu gerar username único
  throw new Error(`Não foi possível gerar um username único baseado em "${baseUsername}". Tente um username diferente.`);
}

/**
 * Verifica se um username está disponível (não existe na tabela users)
 * @param username - Username a verificar
 * @returns Promise com true se disponível, false se já existe
 */
async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    console.log('🔍 Verificando disponibilidade do username:', username);

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (error) {
      // Se o erro for "PGRST116" (não encontrado), o username está disponível
      if (error.code === 'PGRST116') {
        console.log('✅ Username disponível:', username);
        return true;
      }

      // Outro tipo de erro, lançar
      console.error('❌ Erro ao verificar username:', error);
      throw error;
    }

    // Se encontrou dados, username já existe
    if (data) {
      console.log('❌ Username já existe:', username);
      return false;
    }

    // Não deveria chegar aqui, mas por segurança
    return true;
  } catch (error) {
    console.error('💥 Erro geral ao verificar username:', error);
    throw error;
  }
}

/**
 * Sanitiza uma string para uso como username
 * Remove caracteres especiais, converte para minúsculo, limita tamanho
 *
 * @param input - String de entrada
 * @returns String sanitizada adequada para username
 */
function sanitizeUsername(input: string): string {
  return input
    // Converter para minúsculo
    .toLowerCase()
    // Remover acentos e caracteres especiais
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Manter apenas letras, números e underscores
    .replace(/[^a-z0-9_]/g, '')
    // Remover underscores no início e fim
    .replace(/^_+|_+$/g, '')
    // Limitar tamanho (máximo 30 caracteres)
    .substring(0, 30)
    // Garantir que não está vazio
    || 'user';
}
