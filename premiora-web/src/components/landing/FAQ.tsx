/**
 * Componente FAQ da Landing Page
 * Accordion interativo
 */
import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Preciso pagar para começar?",
      answer: "Não! Criar sua página é totalmente gratuito. Nós apenas cobramos uma pequena taxa quando você começa a ganhar dinheiro."
    },
    {
      question: "Como recebo meu dinheiro?",
      answer: "Transferimos seus ganhos diretamente para sua conta bancária via PIX ou transferência, todo mês. Simples e rápido."
    },
    {
      question: "Posso oferecer conteúdo gratuito?",
      answer: "Sim, você pode ter posts públicos para atrair novos seguidores e posts exclusivos para assinantes. É uma ótima estratégia de funil."
    },
    {
      question: "Eu mantenho os direitos do meu trabalho?",
      answer: "Absolutamente. Você mantém 100% da propriedade intelectual de tudo que posta no Premiora. Nós somos apenas a plataforma."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, sem contratos de fidelidade. Você é livre para ir e vir quando quiser."
    }
  ];

  return (
    <section className="faq" style={{ padding: '100px 0', background: 'var(--landing-bg-dark)' }}>
      <div className="container">
        <div className="features-header">
          <h2>Dúvidas comuns</h2>
          <p>Tudo explicado, sem letras miúdas.</p>
        </div>
        
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleIndex(index)}
            >
              <div className="faq-question">
                {faq.question}
                <span style={{ transform: activeIndex === index ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                  ▼
                </span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
