import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { FeatureFlagProvider } from '@schoolapex/core'

import { apolloClient } from './lib/apollo-client'
import App from './App'
import './index.css'

// Suppress known Carbon Design System warnings
const suppressWarnings = () => {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('inert') ||
        message.includes('Received `true` for a non-boolean attribute')) {
      return; // Suppress inert attribute warnings
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('inert') ||
        message.includes('Received `true` for a non-boolean attribute')) {
      return; // Suppress inert attribute errors
    }
    originalError.apply(console, args);
  };
};

// Apply warning suppression immediately
suppressWarnings();

// Register PWA service worker (S22-01)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[Service Worker] Registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[Service Worker] Registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </ApolloProvider>
  </React.StrictMode>,
)