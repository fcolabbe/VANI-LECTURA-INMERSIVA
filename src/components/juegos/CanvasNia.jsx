import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasNia({ onComplete, onBack }) {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [feedback, setFeedback] = useState('Encuentra las burbujas que tengan la letra N');

  useEffect(() => {
    generateBubbles();
  }, [score]);

  const generateBubbles = () => {
    // Generate 6 bubbles with random letters, where 2-3 are 'N'
    const letters = ['N', 'M', 'L', 'S', 'P', 'T'];
    const newBubbles = Array.from({ length: 6 }).map((_, idx) => {
      const isTarget = Math.random() > 0.6;
      const letter = isTarget ? 'N' : letters[Math.floor(Math.random() * (letters.length - 1) + 1)];
      return {
        id: idx,
        letter,
        isTarget: letter === 'N',
        x: 10 + Math.random() * 80, // % from left
        y: 30 + Math.random() * 50, // % from top
        size: 70 + Math.random() * 30, // size in px
        popped: false
      };
    });
    setBubbles(newBubbles);
  };

  const handleBubbleClick = (bubble) => {
    if (bubble.popped) return;

    // Mark bubble as popped
    setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, popped: true } : b));

    if (bubble.isTarget) {
      setFeedback('¡Sí! ¡Escuchaste el sonido de Nia! 🐚');
      setScore(prev => {
        const nextScore = prev + 1;
        if (nextScore >= 5) {
          setTimeout(() => finalizarJuego(), 1500);
        }
        return nextScore;
      });
    } else {
      setFeedback('Ese sonido viaja en otra corriente. ¡Prueba otra!');
    }
  };

  const finalizarJuego = () => {
    console.log("Actividades de Nia finalizadas.");
    if (onComplete) onComplete();
    else navigate('/ecoesfera/agua');
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      backgroundColor: '#f0fdfa',
      backgroundImage: 'linear-gradient(to bottom, #CCFBF1, #f0fdfa)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Botón Volver */}
      <button 
        onClick={() => {
          if (onBack) onBack();
          else navigate('/personaje/nia');
        }}
        style={{
          position: 'absolute', top: '20px', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {/* Marcador de Progreso */}
      <div style={{ marginTop: '60px', width: '100%', maxWidth: '300px', zIndex: 5 }}>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(204, 251, 241, 0.4)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
          <div style={{ width: `${(score / 5) * 100}%`, height: '100%', backgroundColor: '#0d9488', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Feedback Text */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(13,148,136,0.05)',
        width: '90%', maxWidth: '400px',
        zIndex: 5
      }}>
        <p style={{ color: '#0f766e', fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>{feedback}</p>
      </div>

      {/* Area de Juego (Burbujas flotantes) */}
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        {bubbles.map(b => !b.popped && (
          <button
            key={b.id}
            onClick={() => handleBubbleClick(b)}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(13, 148, 136, 0.2) 70%, rgba(13, 148, 136, 0.6) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 16px rgba(13,148,136,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 'bold', color: '#0f766e',
              cursor: 'pointer',
              animation: `pulse ${2 + b.id}s infinite ease-in-out`,
              transition: 'transform 0.1s ease',
              outline: 'none'
            }}
          >
            {b.letter}
          </button>
        ))}
      </div>

      {/* Caracola fija abajo */}
      <div style={{ fontSize: '4rem', marginBottom: '20px', zIndex: 2, animation: 'pulse 3s infinite' }}>🐚</div>

      {/* Pantalla de Éxito Final */}
      {score >= 5 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh',
          backgroundColor: 'rgba(255,255,255,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <h1 style={{ color: '#0d9488', fontSize: '3rem', margin: 0 }}>¡Excelente Oído! 🐚</h1>
          <p style={{ color: '#0f766e', fontSize: '1.3rem', marginTop: '1rem', fontWeight: '500' }}>Los susurros de la caracola han devuelto el orden al arrecife.</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-10px); }
          100% { transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
