import { useState, useMemo } from 'react';
import type { ContentItem } from '../types/content';

/**
 * Hook personalizado para gerenciar funcionalidade de busca
 * Fornece estado de busca e filtragem de itens
 */
export const useSearch = (items: ContentItem[]) => {
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
