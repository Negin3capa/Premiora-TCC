import React from 'react';
import { X } from 'lucide-react';

const CreatorPayments: React.FC = () => {
  return (
    <div className="creator-payments">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Pagamentos</h2>
      
      <div className="creator-tabs" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <button className="active" style={{ paddingBottom: '1rem', borderBottom: '2px solid var(--color-accent)', color: 'var(--color-text-primary)' }}>Sacar</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Documentos</button>
      </div>

      <div style={{ 
        backgroundColor: 'var(--color-bg-secondary)', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        position: 'relative',
        border: '1px solid var(--color-border)'
      }}>
        <button style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-tertiary)' }}>
          <X size={20} />
        </button>
        <h4 style={{ marginBottom: '0.5rem' }}>Manter a segurança do Premiora</h4>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Para evitar fraudes e fazer com que o Premiora seja uma plataforma segura a todos os usuários, você só pode retirar os valores cinco dias depois da sua primeira contribuição. <a href="#" style={{ color: 'var(--color-accent)' }}>Clique aqui</a> para saber mais.
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'var(--color-bg-secondary)', 
        padding: '2rem', 
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Disponível para saque</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>$ 0,00</div>
          <a href="#" style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>Visualizar detalhes</a>
        </div>
        
        <button style={{ 
          backgroundColor: 'var(--color-bg-tertiary)', 
          color: 'var(--color-text-secondary)', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '24px',
          fontWeight: 500,
          cursor: 'not-allowed'
        }}>
          Adicionar forma de recebimento
        </button>
      </div>
    </div>
  );
};

export default CreatorPayments;
