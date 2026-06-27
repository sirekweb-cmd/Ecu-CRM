import { useEffect } from 'react';

export const useCacheBuster = () => {
  useEffect(() => {
    const enforceCacheBusting = async () => {
      try {
        const res = await fetch('/api/version');
        if (!res.ok) return;
        const data = await res.json();
        const currentServerVersion = data.version;
        
        const savedVersion = localStorage.getItem('serverVersion');
        
        if (savedVersion && savedVersion !== currentServerVersion) {
          console.log('Nueva versión detectada en el servidor. Limpiando caché y recargando...');
          
          // Preservar la sesión del usuario para no desloguearlo de forma molesta
          const user = localStorage.getItem('ecu_crm_user');
          const token = localStorage.getItem('ecu_crm_token');
          const department = localStorage.getItem('ecu_crm_department');
          
          localStorage.clear();
          
          if (user) localStorage.setItem('ecu_crm_user', user);
          if (token) localStorage.setItem('ecu_crm_token', token);
          if (department) localStorage.setItem('ecu_crm_department', department);
          
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map((name) => caches.delete(name))
            );
          }

          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }

          localStorage.setItem('serverVersion', currentServerVersion);
          window.location.reload();
        } else {
          localStorage.setItem('serverVersion', currentServerVersion);
        }
      } catch (error) {
        console.error('Error al verificar versión del servidor:', error);
      }
    };

    enforceCacheBusting();
    
    // Verificar cada 2 minutos en segundo plano
    const interval = setInterval(enforceCacheBusting, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
};
