import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import CreatorSettings from '../components/creator/CreatorSettings';
import '../styles/CreatorDashboardPage.css';

/**
 * Página principal da área do criador
 * Funciona como um layout que renderiza diferentes seções
 * com base na URL, como Painel, Biblioteca, Configurações, etc.
 *
 * @component
 */
const CreatorDashboardPage: React.FC = () => {
  const { section = 'dashboard' } = useParams<{ section: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case 'settings':
        return <CreatorSettings />;
      // Adicione outros casos para as diferentes seções aqui
      // case 'dashboard':
      //   return <CreatorOverview />;
      // case 'payments':
      //   return <CreatorPayments />;
      default:
        return <div>Seção não encontrada</div>;
    }
  };

  return (
    <div className="creator-dashboard-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="creator-dashboard-main-content">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="creator-dashboard-container">
          {/* Aqui você pode adicionar uma barra lateral específica do criador se necessário */}
          <div className="creator-dashboard-content">
            {renderSection()}
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default CreatorDashboardPage;
