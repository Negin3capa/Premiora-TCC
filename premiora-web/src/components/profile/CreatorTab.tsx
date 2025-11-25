import React from 'react';
import CreatorOverview from '../creator/CreatorOverview';
import CreatorPayments from '../creator/CreatorPayments';
import CreatorSettings from '../creator/CreatorSettings';
import CreatorSubscribers from '../creator/CreatorSubscribers';

interface CreatorTabProps {
  activeSection: string;
}

const CreatorTab: React.FC<CreatorTabProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
      case 'analytics': // Reusing Overview for Analytics for now as they are similar in the screenshots
        return <CreatorOverview />;
      case 'subscribers':
        return <CreatorSubscribers />;
      case 'payments':
        return <CreatorPayments />;
      case 'settings':
        return <CreatorSettings />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <h2>Seção em construção: {activeSection}</h2>
            <p>Esta funcionalidade estará disponível em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="creator-tab-content" style={{ padding: '2rem 0' }}>
      {renderSection()}
    </div>
  );
};

export default CreatorTab;
