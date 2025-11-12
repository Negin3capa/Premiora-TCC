import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, UserPlus } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import SearchModal from '../components/modals/SearchModal';
import MobileBottomBar from '../components/layout/MobileBottomBar';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { PopularContentService, type PopularProduct, type PopularPost } from '../services/content/PopularContentService';
import { useModal } from '../hooks/useModal';
import '../styles/MobileSearchPage.css';

/**
 * Página de busca móvel
 * Página dedicada para busca em dispositivos móveis com sidebar content
 */
const MobileSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isModalOpen } = useModal();

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
    <div className="mobile-search-page">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Standard Header with Search Bar */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        showSearchBar={true}
        searchBarComponent={
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Buscar no Premiora"
            openSearchModal={true}
          />
        }
      />

      {/* Search Modal */}
      {isModalOpen('search') && searchQuery.trim() && (
        <SearchModal
          isOpen={true}
          onClose={() => {}}
          searchQuery={searchQuery}
        />
      )}

      {/* Conteúdo da página */}
      <main className="mobile-search-content">
        {/* Seja um criador */}
        <section className="mobile-search-section">
          <h2 className="mobile-search-section-title">
            <Sparkles size={20} />
            Seja um criador
          </h2>
          <div className="mobile-search-section-content">
            <p>Compartilhe seu talento e crie conteúdo exclusivo para seus seguidores</p>
            <button className="mobile-search-cta-btn">
              <Sparkles size={16} />
              Começar
            </button>
          </div>
        </section>

        {/* Assuntos do Momento */}
        <section className="mobile-search-section">
          <h2 className="mobile-search-section-title">
            <Flame size={20} />
            Assuntos do Momento
          </h2>
          {sidebarLoading ? (
            <div className="mobile-search-loading">Carregando assuntos...</div>
          ) : (
            <div className="mobile-search-items">
              {popularProducts.length > 0 ? (
                popularProducts.map((product) => (
                  <div key={product.id} className="mobile-search-item">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="mobile-search-item-thumbnail"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/60x60/1F2937/FFFFFF?text=PROD';
                      }}
                    />
                    <div className="mobile-search-item-info">
                      <div className="mobile-search-item-date">{product.date}</div>
                      <div className="mobile-search-item-title">{product.title}</div>
                      <div className="mobile-search-item-price">$ {product.price}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mobile-search-empty">Nenhum assunto encontrado</div>
              )}
            </div>
          )}
        </section>

        {/* Quem Seguir */}
        <section className="mobile-search-section">
          <h2 className="mobile-search-section-title">
            <UserPlus size={20} />
            Quem Seguir
          </h2>
          {sidebarLoading ? (
            <div className="mobile-search-loading">Carregando sugestões...</div>
          ) : (
            <div className="mobile-search-items">
              {popularPosts.length > 0 ? (
                popularPosts.map((post) => (
                  <div key={post.id} className="mobile-search-item">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="mobile-search-item-thumbnail"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/60x40/1F2937/FFFFFF?text=POST';
                      }}
                    />
                    <div className="mobile-search-item-info">
                      <div className="mobile-search-item-title">{post.title}</div>
                      <div className="mobile-search-item-views">{formatViews(post.views)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mobile-search-empty">Nenhuma sugestão encontrada</div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <MobileBottomBar />
    </div>
  );
};

export default MobileSearchPage;
