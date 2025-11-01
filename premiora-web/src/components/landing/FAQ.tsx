/**
 * Componente FAQ da Landing Page
 * Mostra perguntas frequentes sobre a plataforma
 */
import React from 'react';

/**
 * Componente FAQ com perguntas e respostas
 */
const FAQ: React.FC = () => {
  return (
    <section className="faq">
      <div className="container">
        <h2>Perguntas frequentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Como recebo os pagamentos?</h3>
            <p>Os pagamentos são processados mensalmente via PIX, com depósitos diretos em sua conta bancária. Não há intermediários.</p>
          </div>
          <div className="faq-item">
            <h3>Posso cancelar a qualquer momento?</h3>
            <p>Sim! Seus membros podem cancelar a assinatura a qualquer momento, e você pode encerrar sua conta quando quiser.</p>
          </div>
          <div className="faq-item">
            <h3>Quais taxas vocês cobram?</h3>
            <p>Cobramos apenas 5% sobre cada transação, uma das menores taxas do mercado. Não há taxa de setup ou mensalidade.</p>
          </div>
          <div className="faq-item">
            <h3>Meus dados estão seguros?</h3>
            <p>Utilizamos criptografia de nível bancário e nunca compartilhamos seus dados. Somos transparentes sobre nossa privacidade.</p>
          </div>
          <div className="faq-item">
            <h3>Posso importar meu conteúdo?</h3>
            <p>Sim! Você pode importar posts de redes sociais, blogs e outras plataformas para começar rapidamente.</p>
          </div>
          <div className="faq-item">
            <h3>Quanto tempo demora para começar?</h3>
            <p>Você pode configurar sua página em poucos minutos. Os primeiros pagamentos chegam geralmente na primeira semana.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
