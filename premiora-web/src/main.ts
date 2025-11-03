import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ModalProvider } from './contexts/ModalContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { UIProvider } from './contexts/UIContext.tsx';
import App from './App.tsx';
import './styles/globals.css';

// Renderiza o componente React App no elemento com id 'app' com roteamento e provedores de contexto
ReactDOM.createRoot(document.getElementById('app')!).render(
  React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null,
      React.createElement(UIProvider, null,
        React.createElement(NotificationProvider, null,
          React.createElement(ModalProvider, null,
            React.createElement(AuthProvider, null,
              React.createElement(App, null)
            )
          )
        )
      )
    )
  )
);
