import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasBibi({ onComplete, onBack }) {
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Limpia el telescopio tocando solo las 3 estrellas brillantes');

  useEffect(() => {
    generateStars();
  }, []);

  const generateStars = () => {
    // Generate 10 stars, exactly 3 are targets (glowing)
    const newStars = Array.from({ length: 10 }).map((_, idx) => {
      const isTarget = idx < 3; // First 3 are targets
      return {
        id: idx,
        isTarget,
        x: 10 + Math.random() * 80, // % left
        y: 25 + Math.random() * 50, // % top
        clicked: false,
        size: isTarget ? 50 : 30
      };
    });
    // Shuffle the array so target stars are scattered
    setStars(newStars.sort(() => Math.random() - 0.5));
  };

  const handleStarClick = (star) => {
    if (star.clicked) return;

    // Mark as clicked
    setStars(prev => prev.map(s => s.id === star.id ? { ...s, clicked: true } : s));

    if (star.isTarget) {
      setFeedback('¡Encontrada! El telescopio se aclara. 🔭');
      setScore(prev => {
        const nextScore = prev + 1;
        if (nextScore >= 3) {
          setTimeout(() => finalizarJuego(), 1500);
        }
        return nextScore;
      });
    } else {
      setFeedback('Esa estrella es muy tenue. ¡Busca las que brillan fuerte!');
    }
  };

  const finalizarJuego = () => {
    console.log("Actividades de Bibi finalizadas.");
    if (onComplete) onComplete();
    else navigate('/ecoesfera/aire');
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      backgroundColor: '#0f172a', // Fondo espacial oscuro
      backgroundImage: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Botón Volver */}
      <button 
        onClick={() => {
          if (onBack) onBack();
          else navigate('/personaje/bibi');
        }}
        style={{
          position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.4)', color: '#E0F2FE', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {/* Marcador de Progreso */}
      <div style={{ marginTop: '60px', width: '100%', maxWidth: '300px', zIndex: 5 }}>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(224, 242, 254, 0.2)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ width: `${(score / 3) * 100}%`, height: '100%', backgroundColor: '#38BDF8', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Instrucciones */}
      <div style={{
        background: 'rgba(224, 242, 254, 0.35)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        padding: '1rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: 'none',
        width: '90%', maxWidth: '400px',
        zIndex: 5
      }}>
        <p style={{ color: '#52525b', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>{feedback}</p>
      </div>

      {/* Tablero de Estrellas */}
      <div style={{
        flex: 1, width: '100%', position: 'relative',
        filter: score < 3 ? `blur(${6 - score * 2}px)` : 'none',
        transition: 'filter 0.5s ease'
      }}>
        {stars.map(s => !s.clicked && (
          <button
            key={s.id}
            onClick={() => handleStarClick(s)}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: '64px',
              height: '64px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: s.isTarget ? '2.5rem' : '1.2rem',
              animation: s.isTarget ? 'pulseGlow 1.5s infinite alternate' : 'pulseDim 3s infinite alternate',
              outline: 'none',
              padding: 0
            }}
          >
            ⭐
          </button>
        ))}
      </div>

      {/* Bibi Icon o Telescopio */}
      <div style={{ fontSize: '4rem', marginBottom: '20px', zIndex: 2, animation: 'float 3s infinite ease-in-out' }}>🔭</div>

      {/* Pantalla de Éxito Final */}
      {score >= 3 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh',
          backgroundColor: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <h1 style={{ color: '#38BDF8', fontSize: '3rem', margin: 0 }}>¡Foco Completo! 🔭</h1>
          <p style={{ color: '#E0F2FE', fontSize: '1.3rem', marginTop: '1rem', fontWeight: '500' }}>El telescopio de Bibi ahora ve el universo limpio.</p>
        </div>
      )}

      <style>{`
        @keyframes pulseGlow {
          from { transform: scale(1); filter: drop-shadow(0 0 5px #38bdf8); }
          to { transform: scale(1.3); filter: drop-shadow(0 0 20px #38bdf8); }
        }
        @keyframes pulseDim {
          from { transform: scale(0.9); opacity: 0.4; }
          to { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
