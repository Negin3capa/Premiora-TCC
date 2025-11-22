import React from 'react';
import '../../styles/SubscriptionConfig.css';

const SubscriptionConfigSkeleton: React.FC = () => {
  return (
    <div className="subscription-config skeleton">
      <div className="subscription-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="tier-card skeleton-card">
            <div className="tier-header skeleton-header">
              <div className="skeleton-text title"></div>
              <div className="skeleton-text price"></div>
            </div>
            <div className="tier-body">
              <div className="skeleton-text description"></div>
              <div className="skeleton-text description short"></div>
              
              <div className="tier-benefits">
                <div className="skeleton-text subtitle"></div>
                <ul>
                  {[1, 2, 3].map((j) => (
                    <li key={j} className="skeleton-benefit">
                      <div className="skeleton-circle"></div>
                      <div className="skeleton-text benefit"></div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="tier-actions">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionConfigSkeleton;
