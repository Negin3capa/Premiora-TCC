import React, { useState, useEffect } from 'react';
import { PopularContentService, type PopularProduct, type PopularPost } from '../../services/content/PopularContentService';
import { Sparkles, Flame, UserPlus } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import '../../styles/FeedSidebar.css';

/**
 * Componente SidebarFeed - Sidebar para o feed do dashboard
 * Contém seções de "Seja um criador", "Assuntos do Momento" e "Quem Seguir"
 * Baseado na sidebar do PostsTabEnhanced, adaptado para o contexto do feed
 *
 * @component
 */
const SidebarFeed: React.FC = () => {
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Formata número de visualizações
   */
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M visualizações`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K visualizações`;
    } else {
      return `${views} visualizações`;
    }
  };

  /**
   * Carrega dados da sidebar (produtos e posts populares)
   */
  const loadSidebarData = async () => {
    try {
      setSidebarLoading(true);
      const [products, posts] = await Promise.all([
        PopularContentService.getPopularProducts(5), // Produtos populares globais
        PopularContentService.getPopularPosts(5) // Posts populares globais
      ]);

      setPopularProducts(products);
      setPopularPosts(posts);
    } catch (error) {
      console.error('Erro ao carregar dados da sidebar:', error);
      // Em caso de erro, manter dados vazios ou fallback
      setPopularProducts([]);
      setPopularPosts([]);
    } finally {
      setSidebarLoading(false);
    }
  };

  // Carregar dados da sidebar ao montar o componente
  useEffect(() => {
    loadSidebarData();
  }, []);

  return (
    <aside className="feed-sidebar">
      {/* Barra de Pesquisa */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Buscar no feed"
      />

      {/* Seja um criador */}
      <div className="feed-sidebar-section gift-section">
        <h3 className="feed-sidebar-title">
          <Sparkles size={20} />
          Seja um criador
        </h3>
        <div className="gift-content">
          <p>Compartilhe seu talento e crie conteúdo exclusivo para seus seguidores</p>
          <button className="gift-btn">
            <Sparkles size={16} />
            Começar
          </button>
        </div>
      </div>

      {/* Assuntos do Momento */}
      <div className="feed-sidebar-section products-section">
        <h3 className="feed-sidebar-title">
          <Flame size={20} />
          Assuntos do Momento
        </h3>
        {sidebarLoading ? (
          <div className="feed-sidebar-loading">Carregando assuntos...</div>
        ) : (
          <div className="products-list">
            {popularProducts.length > 0 ? (
              popularProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="product-thumbnail"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/60x60/1F2937/FFFFFF?text=PROD';
                    }}
                  />
                  <div className="product-info">
                    <div className="product-date">{product.date}</div>
                    <div className="product-title">{product.title}</div>
                    <div className="product-price">$ {product.price}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="feed-sidebar-empty">Nenhum assunto encontrado</div>
            )}
          </div>
        )}
      </div>

      {/* Quem Seguir */}
      <div className="feed-sidebar-section popular-posts-section">
        <h3 className="feed-sidebar-title">
          <UserPlus size={20} />
          Quem Seguir
        </h3>
        {sidebarLoading ? (
          <div className="feed-sidebar-loading">Carregando sugestões...</div>
        ) : (
          <div className="popular-posts-list">
            {popularPosts.length > 0 ? (
              popularPosts.map((post) => (
                <div key={post.id} className="popular-post-item">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="popular-post-thumbnail"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/60x40/1F2937/FFFFFF?text=POST';
                    }}
                  />
                  <div className="popular-post-info">
                    <div className="popular-post-title">{post.title}</div>
                    <div className="popular-post-views">{formatViews(post.views)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="feed-sidebar-empty">Nenhuma sugestão encontrada</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarFeed;
