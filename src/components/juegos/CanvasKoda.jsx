import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasKoda({ onComplete, onBack }) {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [signal, setSignal] = useState('ESPERA'); // 'ESPERA' | 'TOCA' | 'NO_TOQUES'
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    startTrial();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [attempts]);

  const startTrial = () => {
    setSignal('ESPERA');
    setFeedback('');
    setIsPlaying(false);

    // Random delay between 1.5s and 3.5s
    const delay = 1500 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      const isStop = Math.random() > 0.6; // 40% chance of "NO TOQUES"
      setSignal(isStop ? 'NO_TOQUES' : 'TOCA');
      setIsPlaying(true);

      if (isStop) {
        // If it's a stop signal, child must NOT tap for 1.8 seconds to win
        timerRef.current = setTimeout(() => {
          setScore(prev => {
            const nextScore = prev + 1;
            setFeedback('¡Muy bien! Guardaste silencio.');
            if (nextScore >= 3) {
              setTimeout(() => finalizarJuego(), 1500);
            } else {
              setTimeout(() => setAttempts(a => a + 1), 1500);
            }
            return nextScore;
          });
        }, 1800);
      }
    }, delay);
  };

  const handleDrumClick = () => {
    if (!isPlaying) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);

    if (signal === 'NO_TOQUES') {
      setFeedback('¡Oops! Debías esperar.');
      // Play a visual shake or flash red
      setTimeout(() => {
        setAttempts(a => a + 1);
      }, 1500);
    } else if (signal === 'TOCA') {
      setFeedback('¡BUM! ¡Excelente ritmo!');
      setScore(prev => {
        const nextScore = prev + 1;
        if (nextScore >= 3) {
          setTimeout(() => finalizarJuego(), 1500);
        } else {
          setTimeout(() => setAttempts(a => a + 1), 1500);
        }
        return nextScore;
      });
    }
  };

  const finalizarJuego = () => {
    console.log("Actividades de Koda finalizadas.");
    if (onComplete) onComplete();
    else navigate('/ecoesfera/tierra');
  };

  const getSignalColor = () => {
    if (signal === 'TOCA') return '#0D9488'; // Verde Agua
    if (signal === 'NO_TOQUES') return '#D97706'; // Ámbar
    return '#78350F'; // Siena
  };

  const getSignalText = () => {
    if (signal === 'TOCA') return '¡TOCA EL TAMBOR!';
    if (signal === 'NO_TOQUES') return '¡ESPERA EN SILENCIO!';
    return 'Escucha el viento...';
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      backgroundColor: '#fef3c7',
      backgroundImage: 'linear-gradient(to bottom, #FDE68A, #fef3c7)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
      position: 'relative'
    }}>
      {/* Botón Volver */}
      <button 
        onClick={() => {
          if (onBack) onBack();
          else navigate('/personaje/koda');
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
      <div style={{ marginTop: '60px', width: '100%', maxWidth: '300px' }}>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(253, 230, 138, 0.4)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(120, 53, 15, 0.2)' }}>
          <div style={{ width: `${(score / 3) * 100}%`, height: '100%', backgroundColor: '#D97706', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Indicador de Señal */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem 3rem',
        borderRadius: '24px',
        border: `3px solid ${getSignalColor()}`,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(6,78,59,0.05)',
        width: '80%', maxWidth: '400px',
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{ color: getSignalColor(), margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
          {getSignalText()}
        </h2>
        {feedback && <p style={{ color: '#78350F', fontSize: '1.1rem', marginTop: '10px', fontWeight: '500' }}>{feedback}</p>}
      </div>

      {/* Tambor Interactivo */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <button
          onClick={handleDrumClick}
          style={{
            width: '180px', height: '180px',
            borderRadius: '50%',
            backgroundColor: '#d97706', // Color madera
            border: '10px solid #f59e0b',
            boxShadow: '0 12px 24px rgba(217,119,6,0.3), inset 0 8px 16px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem',
            transition: 'transform 0.1s ease',
            outline: 'none'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🥁
        </button>
      </div>

      {/* Pantalla de Éxito Final */}
      {score >= 3 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh',
          backgroundColor: 'rgba(255,255,255,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <h1 style={{ color: '#78350F', fontSize: '3rem', margin: 0 }}>¡Gran Compás! 🥁</h1>
          <p style={{ color: '#D97706', fontSize: '1.3rem', marginTop: '1rem', fontWeight: '500' }}>Has despertado el ritmo de la selva.</p>
        </div>
      )}
    </div>
  );
}
