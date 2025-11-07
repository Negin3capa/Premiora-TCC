/**
 * Layout raiz da aplicação
 * Componente que envolve todas as rotas protegidas com sidebar persistente
 *
 * @component
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Header, MobileBottomBar } from './index';
import '../../styles/RootLayout.css';

/**
 * Layout raiz que mantém a sidebar persistente entre navegações
 * Resolve o problema de colapso de largura durante navegação via sidebar
 */
const RootLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      {/* Barra inferior móvel */}
      <MobileBottomBar />
    </div>
  );
};

export default RootLayout;
