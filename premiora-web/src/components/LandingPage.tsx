import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Benefits from './Benefits';
import CTA from './CTA';
import Footer from './Footer';

// Componente Landing Page
const LandingPage: React.FC = () => {
  return React.createElement('div', { className: 'App' },
    React.createElement(Navbar, null),
    React.createElement(Hero, null),
    React.createElement(Features, null),
    React.createElement(Benefits, null),
    React.createElement(CTA, null),
    React.createElement(Footer, null)
  );
};

export default LandingPage;
