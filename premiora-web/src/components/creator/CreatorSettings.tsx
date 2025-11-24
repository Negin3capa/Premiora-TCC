import React from 'react';
import { Plus } from 'lucide-react';
import '../../styles/CreatorSettings.css';

/**
 * Componente para as configurações da área do criador
 * Permite gerenciar equipe, aplicativos, notificações e pagamentos
 * 
 * @component
 */
const CreatorSettings: React.FC = () => {
  return (
    <div className="creator-settings">
      <h2>Configurações</h2>
      
      <div className="creator-tabs">
        <button>Conta</button>
        <button className="active">Equipe</button>
        <button>Aplicativos</button>
        <button>Podcast e áudio</button>
        <button>Notificações</button>
        <button>Cobranças e pagamentos</button>
      </div>

      <div className="settings-card">
        <h3>Sua equipe</h3>
        <p className="card-description">
          O líder da equipe tem permissão total para acessar tudo na conta.
        </p>
        <p className="card-sub-description">
          Só o líder da equipe pode adicionar ou remover colegas de equipe, ver informações sobre ganhos e pagamentos, fazer reembolsos e atualizar as configurações da conta. <a href="#">Saiba mais</a>
        </p>

        <div className="team-member">
          <div className="team-member-avatar">
            E
          </div>
          <div className="team-member-info">
            <div className="member-name">Você (líder de equipe)</div>
            <div className="member-email">edycarlos020407@gmail.com</div>
          </div>
        </div>

        <button className="invite-button">
          <Plus size={20} />
          Convidar colega de equipe
        </button>
      </div>
    </div>
  );
};

export default CreatorSettings;
