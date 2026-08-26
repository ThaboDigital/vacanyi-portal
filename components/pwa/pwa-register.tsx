'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Vacanyi Portal PWA registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.warn('PWA registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
