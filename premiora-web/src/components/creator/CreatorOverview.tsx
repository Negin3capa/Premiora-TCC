import React from 'react';
import { Users, UserPlus, UserX } from 'lucide-react';
import '../../styles/CommunityPage.css'; // Reusing styles

const CreatorOverview: React.FC = () => {
  return (
    <div className="creator-overview">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Informações</h2>
      
      <div className="creator-tabs" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <button className="active" style={{ paddingBottom: '1rem', borderBottom: '2px solid var(--color-accent)', color: 'var(--color-text-primary)' }}>Assinatura</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Ganhos</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Posts</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Pesquisas</button>
        <button style={{ paddingBottom: '1rem', color: 'var(--color-text-secondary)' }}>Tráfego</button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <select style={{ 
          backgroundColor: 'var(--color-bg-secondary)', 
          color: 'var(--color-text-primary)', 
          padding: '0.5rem 1rem', 
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <option>Últimos 30 dias</option>
          <option>Últimos 7 dias</option>
          <option>Este mês</option>
        </select>
        <span style={{ marginLeft: 'auto', float: 'right', color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
          Última atualização às 13:06
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <span>Membros ativos</span>
            <Users size={16} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>0</div>
        </div>
        <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <span>Novos membros</span>
            <UserPlus size={16} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>0</div>
        </div>
        <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <span>Cancelado</span>
            <UserX size={16} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>0</div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'var(--color-bg-secondary)', 
        borderRadius: '12px', 
        padding: '4rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '3rem'
      }}>
        <BarChartIcon />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Nenhum dado para exibição</p>
      </div>

      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Planos mais completos e planos mais básicos</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Aqui, você pode consultar o número de membros ativos que passaram a um plano mais completo ou mais básico recentemente.
      </p>
      
      <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>
        Ninguém passou para um plano mais completo ou mais básico.
      </div>
    </div>
  );
};

const BarChartIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-tertiary)' }}>
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

export default CreatorOverview;
