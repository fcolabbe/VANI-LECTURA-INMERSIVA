import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ParentalGate() {
  const navigate = useNavigate();
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);
  const DURATION = 3000; // 3 segundos

  const handlePressStart = () => {
    setIsPressing(true);
    setProgress(0);
    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(percent);
    }, 50);

    pressTimer.current = setTimeout(() => {
      clearInterval(progressInterval.current);
      navigate('/padres');
    }, DURATION);
  };

  const handlePressEnd = () => {
    setIsPressing(false);
    setProgress(0);
    clearTimeout(pressTimer.current);
    clearInterval(progressInterval.current);
  };

  useEffect(() => {
    return () => {
      clearTimeout(pressTimer.current);
      clearInterval(progressInterval.current);
    };
  }, []);

  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
      {/* Icono sutil para padres con Glassmorphism mejorado */}
      <button
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d97706', // Color Vani mágico
          fontSize: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}
      >
        ★
        {isPressing && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${progress}%`,
            background: 'rgba(255, 235, 133, 0.6)',
            transition: 'height 0.05s linear'
          }}></div>
        )}
      </button>
      
      {/* Información clara solo cuando se interactúa, dirigida al padre */}
      <div style={{
        position: 'absolute',
        top: '70px',
        left: '0',
        width: '220px',
        opacity: isPressing ? 1 : 0,
        transition: 'opacity 0.3s ease',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        color: '#4a4a4a',
        padding: '12px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        pointerEvents: 'none',
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        lineHeight: '1.4'
      }}>
        Mantén presionado por 3 segundos para acceder al Panel de Control de Padres.
      </div>
    </div>
  );
}
