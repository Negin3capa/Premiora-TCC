/**
 * Layout raiz da aplicação
 * Componente que envolve todas as rotas protegidas com sidebar persistente
 *
 * @component
 */
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Header, MobileBottomBar } from './index';
import '../../styles/RootLayout.css';

/**
 * Hook para detectar se está em dispositivo móvel
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check on client-side mount
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

/**
 * Layout raiz que mantém a sidebar persistente entre navegações
 * Resolve o problema de colapso de largura durante navegação via sidebar
 */
const RootLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="root-layout">
      {/* Sidebar persistente */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div className="main-content">
        {/* Header fixo */}
        <Header />

        {/* Conteúdo das páginas */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* Barra inferior móvel - apenas para dispositivos móveis */}
      {isMobile && <MobileBottomBar />}
    </div>
  );
};

export default RootLayout;
