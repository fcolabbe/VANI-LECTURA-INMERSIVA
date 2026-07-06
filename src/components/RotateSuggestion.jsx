import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'vani_rotate_hint_shown';
const AUTO_HIDE_MS = 8000;

export default function RotateSuggestion() {
  // El aviso se muestra una sola vez por dispositivo; la app funciona bien en vertical
  const [isVisible, setIsVisible] = useState(() => {
    if (localStorage.getItem(STORAGE_KEY)) return false;
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth < 768;
    return isPortrait && isSmallScreen;
  });

  useEffect(() => {
    if (!isVisible) return;
    localStorage.setItem(STORAGE_KEY, 'true');
    const timer = setTimeout(() => setIsVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(12px + env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: 'calc(100vw - 24px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 14px',
      borderRadius: '16px',
      boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
      border: '1px solid #e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animation: 'rotateHintIn 0.4s ease'
    }}>
      <style>{`
        @keyframes rotateHintIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>📱</span>
      <span style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>
        Consejo: en horizontal o en tablet la aventura se ve aún mejor.
      </span>
      <button
        onClick={() => setIsVisible(false)}
        aria-label="Cerrar aviso"
        style={{
          flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
          background: '#f1f5f9', color: '#64748b', border: 'none',
          fontSize: '1rem', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}
      >
        ✕
      </button>
    </div>
  );
}
