import React from 'react';

const Sidebar: React.FC = () => {
  const navigationItems = [
    { icon: '🏠', label: 'Home', active: true },
    { icon: '🔥', label: 'Trending', active: false },
    { icon: '📺', label: 'Videos', active: false },
    { icon: '📱', label: 'Live', active: false },
    { icon: '👥', label: 'Following', active: false },
    { icon: '❤️', label: 'Liked', active: false },
    { icon: '📚', label: 'Library', active: false },
    { icon: '⚙️', label: 'Settings', active: false },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Premiora</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item, index) => (
            <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
              <button className="nav-button">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="creator-section">
          <h3>Creators em Alta</h3>
          <div className="mini-creator-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="mini-creator-item">
                <img 
                  src={`/placeholder.svg?height=32&width=32`}
                  alt={`Creator ${i}`}
                  className="mini-creator-avatar"
                />
                <div className="mini-creator-info">
                  <span className="mini-creator-name">Creator {i}</span>
                  <span className="mini-creator-status">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
