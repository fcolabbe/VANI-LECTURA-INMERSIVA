import { useState, useEffect } from 'react';

export function useResponsive() {
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Consideramos Tablet/Landscape si el ancho es mayor a 767px 
      // y la relación de aspecto es horizontal (ancho > alto)
      const isLandscape = window.innerWidth > window.innerHeight;
      const isLargeScreen = window.innerWidth >= 768;
      
      setIsTabletLandscape(isLandscape && isLargeScreen);
    };

    // Ejecución inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isTabletLandscape };
}
