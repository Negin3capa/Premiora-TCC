import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import App from './App.tsx';
import './styles/globals.css';
import './styles/index.css';

// Renderiza o componente React App no elemento com id 'app' com roteamento e provedor de autenticação
ReactDOM.createRoot(document.getElementById('app')!).render(
  React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null,
      React.createElement(AuthProvider, null,
        React.createElement(App, null)
      )
    )
  )
);
