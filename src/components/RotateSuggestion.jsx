import React, { useState, useEffect } from 'react';

export default function RotateSuggestion() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Si la sesión ya indicó que ignoráramos la sugerencia, no la mostramos
    const hasIgnored = sessionStorage.getItem('vani_ignore_rotate');
    if (hasIgnored) return;

    const checkOrientation = () => {
      // Mostrar si estamos en un dispositivo estrecho y en formato vertical
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth < 768;

      if (isPortrait && isSmallScreen) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('vani_ignore_rotate', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100dvh',
      backgroundColor: 'rgba(247, 243, 235, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        fontSize: '5rem',
        marginBottom: '1rem',
        animation: 'spinAndShake 3s ease-in-out infinite'
      }}>
        📱
      </div>
      
      <style>{`
        @keyframes spinAndShake {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(-90deg); }
          80% { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      <h1 style={{ color: '#4a5b57', fontSize: '2rem', marginBottom: '1rem' }}>
        ¡Gira tu pantalla!
      </h1>
      
      <p style={{ color: '#475569', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '3rem', maxWidth: '400px' }}>
        Para disfrutar al máximo de la magia del Método VANI, te sugerimos usar el dispositivo en formato horizontal o una Tablet.
      </p>

      <button 
        onClick={handleDismiss}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#fff',
          color: '#64748b',
          border: '2px solid #e2e8f0',
          borderRadius: '30px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}
      >
        Continuar en vertical
      </button>
    </div>
  );
}
