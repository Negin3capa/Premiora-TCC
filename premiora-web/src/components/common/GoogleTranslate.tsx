import React from 'react';
import '../../styles/GoogleTranslate.css';

/**
 * Google Translate Widget Component
 * Renders the container for the Google Translate widget
 */
const GoogleTranslate: React.FC = () => {
  return (
    <div className="google-translate-container">
      <div id="google_translate_element"></div>
    </div>
  );
};

export default GoogleTranslate;
