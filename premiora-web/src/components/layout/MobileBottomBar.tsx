/**
 * Componente MobileBottomBar
 * Barra de navegação inferior para dispositivos móveis
 * Fornece acesso rápido aos itens principais: Home, Notificações, Mensagens, Comunidades e Configurações
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

/**
 * Hook personalizado para detectar scroll e controlar visibilidade da bottom bar
 */
const useScrollVisibility = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Only apply scroll behavior on mobile devices
    if (window.innerWidth > 768) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50; // Minimum scroll distance to trigger hide/show

      // Determine scroll direction and distance
      const isScrollingDown = currentScrollY > lastScrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only trigger if scrolled enough
      if (scrollDifference > scrollThreshold) {
        if (isScrollingDown && currentScrollY > 100) {
          // Scrolling down - hide bottom bar
          setIsHidden(true);
        } else if (!isScrollingDown) {
          // Scrolling up - show bottom bar
          setIsHidden(false);
        }

        setLastScrollY(currentScrollY);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  return isHidden;
};

interface MobileBottomBarProps {
  className?: string;
}

/**
 * Barra de navegação móvel inferior
 * Exibe apenas os itens essenciais de navegação para dispositivos móveis
 */
const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHidden = useScrollVisibility();

  // Itens de navegação para a barra móvel (apenas os essenciais)
  const mobileNavigationItems = [
    { icon: <Home size={20} />, label: 'Home', route: '/dashboard' },
    { icon: <Search size={20} />, label: 'Buscar', route: '/search' },
  ];

  /**
   * Handler para navegação entre páginas
   */
  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <nav className={`mobile-bottom-bar ${isHidden ? 'mobile-bottom-bar--hidden' : ''} ${className}`}>
      <div className="mobile-bottom-bar-content">
        {mobileNavigationItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <button
              key={item.route}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.route)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomBar;
