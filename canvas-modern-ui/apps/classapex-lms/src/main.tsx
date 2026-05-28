import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { FeatureFlagProvider } from '@schoolapex/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

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

// Register PWA service worker in production, unregister in development (S22-01)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error);
        });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[Service Worker] Unregistered active service worker in development mode.');
        });
      }
    });
  }
}

// Initialize Capacitor native plugins when running in a native context
const initializeNativePlugins = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0f172a' })
    await SplashScreen.hide()
    console.log('[Capacitor] Native plugins initialized')
  } catch (error) {
    // Expected when running in a standard browser (not a native shell)
    console.log('[Capacitor] Not in native context, skipping native plugin init')
  }
}

initializeNativePlugins()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </ApolloProvider>
  </React.StrictMode>,
)