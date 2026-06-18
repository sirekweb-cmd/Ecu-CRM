import { useEffect } from 'react';

// Genera un ID de versión único cada vez que se carga en el navegador 
// Si prefieres usar una versión real, puedes cambiar esto por una variable de entorno como import.meta.env.VITE_APP_VERSION
const currentAppVersion = "1.0.1"; // Se quitó el Date.getTime() para evitar borrar el localStorage en cada recarga

export const useCacheBuster = () => {
  useEffect(() => {
    const enforceCacheBusting = async () => {
      try {
        // Verificar versión actual contra la guardada en el almacenamiento local
        const savedVersion = localStorage.getItem('appVersion');
        
        // Si hay una diferencia de versión (o no existe) y no estamos en medio de un recargo, recargamos
        if (savedVersion !== currentAppVersion && !sessionStorage.getItem('isReloading')) {
          console.log('Nueva versión detectada. Limpiando caché y recargando...');
          
          // Limpiar Storage y Cache API
          localStorage.clear();
          
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map((name) => caches.delete(name))
            );
          }

          // Desregistrar Service Workers si existen
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }

          // Guardar nueva versión
          localStorage.setItem('appVersion', currentAppVersion);
          sessionStorage.setItem('isReloading', 'true');

          // Forzar recarga desde el servidor (no desde la caché)
          window.location.reload();
        } else {
          // Ya se recargó y estamos en la versión correcta
          sessionStorage.removeItem('isReloading');
          localStorage.setItem('appVersion', currentAppVersion);
        }
      } catch (error) {
        console.error('Error al limpiar caché:', error);
      }
    };

    enforceCacheBusting();
  }, []);
};
