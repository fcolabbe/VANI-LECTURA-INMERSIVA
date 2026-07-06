import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasSora({ onComplete, onBack }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef(null);

  const startDrag = (e) => {
    e.stopPropagation();
    setIsDrawing(true);
  };

  const moveDrag = (e) => {
    if (!isDrawing) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    // Convert coordinates relative to container width
    const relativeX = clientX - rect.left;
    const currentProgress = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));

    // To ensure fluid curve, progress must grow sequentially (optional check, simple tracking is fine)
    setProgress(currentProgress);

    if (currentProgress >= 95) {
      setIsDrawing(false);
      setTimeout(() => finalizarJuego(), 1500);
    }
  };

  const stopDrag = () => {
    if (isDrawing && progress < 95) {
      setProgress(0);
      setIsDrawing(false);
    }
  };

  const finalizarJuego = () => {
    console.log("Actividades de Sora finalizadas.");
    if (onComplete) onComplete();
    else navigate('/ecoesfera/aire');
  };

  // Get Y position of the wind wave path at a given X %
  // Wave formula: amplitude * sin(frequency * x) + offset
  const getWaveY = (xPercent) => {
    const angle = (xPercent / 100) * Math.PI * 2;
    return Math.sin(angle) * 50 + 150; // height offset is 150px
  };

  return (
    <div 
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
      style={{
        width: '100vw', height: '100dvh',
        backgroundColor: '#f0f9ff', // Bioma de Aire: Azul claro cielo
        backgroundImage: 'linear-gradient(to bottom, #E0F2FE, #f0f9ff)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
        position: 'relative', overflow: 'hidden'
      }}
    >
      {/* Botón Volver */}
      <button 
        onClick={() => {
          if (onBack) onBack();
          else navigate('/personaje/sora');
        }}
        style={{
          position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {/* Título de la actividad */}
      <div style={{
        marginTop: '60px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(14,165,233,0.05)',
        width: '90%', maxWidth: '400px',
        zIndex: 5
      }}>
        <p style={{ color: '#0369a1', fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
          Guía la cometa por la corriente del viento
        </p>
      </div>

      {/* Área del Trazo Curvo */}
      <div 
        ref={containerRef}
        style={{
          width: '80%', height: '300px',
          position: 'relative',
          display: 'flex', alignItems: 'center',
          touchAction: 'none'
        }}
      >
        {/* Render the wave line */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path
            d={`M 0 ${getWaveY(0)} ${Array.from({ length: 101 }).map((_, i) => `L ${(i / 100) * 100}% ${getWaveY(i)}`).join(' ')}`}
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="8"
            strokeDasharray="10 10"
          />
          <path
            d={`M 0 ${getWaveY(0)} ${Array.from({ length: Math.ceil(progress) + 1 }).map((_, i) => `L ${(i / 100) * 100}% ${getWaveY(i)}`).join(' ')}`}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="8"
          />
        </svg>

        {/* Kite Handle/Anchor */}
        <div
          onPointerDown={startDrag}
          style={{
            position: 'absolute',
            left: `calc(${progress}% - 32px)`,
            top: `${getWaveY(progress) - 32}px`,
            width: '64px',
            height: '64px',
            backgroundColor: '#38BDF8',
            borderRadius: '50%',
            boxShadow: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
            touchAction: 'none',
            zIndex: 10,
            transition: 'transform 0.1s ease'
          }}
        >
          🪁
        </div>
      </div>

      <div style={{ height: '40px' }} />

      {/* Pantalla de Éxito Final */}
      {progress >= 95 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh',
          backgroundColor: 'rgba(255,255,255,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <h1 style={{ color: '#38BDF8', fontSize: '3rem', margin: 0 }}>¡Buen Trazo! 🪁</h1>
          <p style={{ color: '#52525b', fontSize: '1.3rem', marginTop: '1rem', fontWeight: '500' }}>Has dibujado el puente de viento entre las islas.</p>
        </div>
      )}
    </div>
  );
}
