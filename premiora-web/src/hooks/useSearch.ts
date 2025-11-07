import { useState, useMemo, useEffect, useCallback } from 'react';
import { SearchService } from '../services/content';
import type { ContentItem } from '../types/content';
import type { Community } from '../types/community';

/**
 * Hook personalizado para gerenciar funcionalidade de busca global
 * Fornece busca em tempo real com debouncing para comunidades e conteúdo
 */
export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executa busca global com debouncing
   */
  const performSearch = useCallback(async (query: string) => {
    console.log('performSearch called with query:', query);
    if (!query.trim()) {
      console.log('Query is empty, clearing results');
      setUsers([]);
      setCommunities([]);
      setContent([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Calling SearchService.globalSearch...');
      const results = await SearchService.globalSearch(query, {
        usersLimit: 5,
        communitiesLimit: 5,
        contentLimit: 8
      });

      console.log('Search results:', results);
      setUsers(results.users);
      setCommunities(results.communities);
      setContent(results.content);
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao realizar busca. Tente novamente.');
      setUsers([]);
      setCommunities([]);
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Debounced search effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  /**
   * Limpa resultados da busca
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setUsers([]);
    setCommunities([]);
    setContent([]);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Verifica se há resultados de busca
   */
  const hasResults = useMemo(() => {
    return users.length > 0 || communities.length > 0 || content.length > 0;
  }, [users, communities, content]);

  return {
    // Estado
    searchQuery,
    users,
    communities,
    content,
    loading,
    error,
    hasResults,

    // Ações
    setSearchQuery,
    clearSearch,
    performSearch
  };
};

/**
 * Hook legado para filtragem local de itens (mantido para compatibilidade)
 * @deprecated Use useSearch() para busca global
 */
export const useLocalSearch = (items: ContentItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filtra itens baseado na query de busca
   * Busca por título, autor e conteúdo
   */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    return items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      (item.content && item.content.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems
  };
};
