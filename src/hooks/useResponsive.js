import { useState, useEffect } from 'react';

function computeViewport() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isLandscape = w > h;

  return {
    // Pantallas angostas (teléfonos y tablets chicas en vertical)
    isMobile: w < 768,
    isLandscape,
    // Layouts de pantalla dividida: horizontal con ancho de tablet
    // (incluye teléfonos grandes en horizontal, que también se benefician del split)
    isTabletLandscape: isLandscape && w >= 768,
    // Horizontal con muy poca altura (teléfono acostado): compactar paddings y títulos
    isShortLandscape: isLandscape && h < 500,
  };
}

export function useResponsive() {
  const [viewport, setViewport] = useState(computeViewport);

  useEffect(() => {
    const handleResize = () => setViewport(computeViewport());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
