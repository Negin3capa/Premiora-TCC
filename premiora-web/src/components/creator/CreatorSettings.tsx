import React from 'react';
import { Plus } from 'lucide-react';

const CreatorSettings: React.FC = () => {
  return (
    <div className="creator-settings">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Configurações</h2>
      
      <div className="creator-tabs" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Conta</button>
        <button className="active" style={{ paddingBottom: '1rem', borderBottom: '2px solid var(--color-accent)', color: 'var(--color-text-primary)' }}>Equipe</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Aplicativos</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Podcast e áudio</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Notificações</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Cobranças e pagamentos</button>
      </div>

      <div style={{ 
        backgroundColor: 'var(--color-bg-secondary)', 
        padding: '2rem', 
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sua equipe</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          O líder da equipe tem permissão total para acessar tudo na conta.
        </p>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Só o líder da equipe pode adicionar ou remover colegas de equipe, ver informações sobre ganhos e pagamentos, fazer reembolsos e atualizar as configurações da conta. <a href="#" style={{ color: 'var(--color-accent)' }}>Saiba mais</a>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: '#FF424D', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            E
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>Você (líder de equipe)</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>edycarlos020407@gmail.com</div>
          </div>
        </div>

        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--color-accent)', 
          background: 'none', 
          border: 'none', 
          padding: 0,
          cursor: 'pointer',
          fontWeight: 500
        }}>
          <Plus size={20} />
          Convidar colega de equipe
        </button>
      </div>
    </div>
  );
};

export default CreatorSettings;
