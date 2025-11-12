import React from 'react';
import { ShoppingCart, Clock, Star } from 'lucide-react';
import '../../styles/ShopTab.css';

/**
 * Componente ShopTab - Aba de compras do perfil
 * Placeholder para o sistema de compras que ainda não foi implementado
 */
const ShopTab: React.FC = () => {
  return (
    <div className="shop-tab">
      <div className="coming-soon">
        <div className="coming-soon-icon">
          <ShoppingCart size={64} />
        </div>
        <h2>Loja em Breve</h2>
        <p>O sistema de compras ainda está em desenvolvimento.</p>
        <p>Em breve você poderá:</p>

        <div className="features-list">
          <div className="feature-item">
            <Star size={20} />
            <span>Comprar conteúdo exclusivo</span>
          </div>
          <div className="feature-item">
            <Clock size={20} />
            <span>Acessar posts premium</span>
          </div>
          <div className="feature-item">
            <ShoppingCart size={20} />
            <span>Adquirir produtos digitais</span>
          </div>
        </div>

        <div className="coming-soon-notice">
          <p>Estamos trabalhando duro para trazer esta funcionalidade o mais breve possível!</p>
        </div>
      </div>
    </div>
  );
};

export default ShopTab;
