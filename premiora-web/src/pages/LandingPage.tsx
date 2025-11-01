/**
 * Landing Page do Premiora
 * Design inspirado no Patreon - plataforma para monetização de conteúdo
 */
import React from 'react';
import {
  Header,
  Hero,
  SocialProof,
  HowItWorks,
  Features,
  Testimonials,
  Pricing,
  FAQ,
  CTA,
  Footer
} from '../components/landing';
import '../styles/landing-page.css';

/**
 * Componente principal da Landing Page inspirada no Patreon
 * Estrutura modular otimizada para conversão de criadores de conteúdo
 *
 * Refatoração aplicada:
 * - Quebrado em 9 componentes menores e reutilizáveis
 * - Redução de ~400 linhas para ~25 linhas
 * - Melhor manutenibilidade e testabilidade
 * - Separação clara de responsabilidades
 */
const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
