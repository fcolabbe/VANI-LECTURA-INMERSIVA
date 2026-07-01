import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasLulu({ onComplete, onBack }) {
  const navigate = useNavigate();
  const [placed, setPlaced] = useState({ red: false, blue: false, yellow: false });
  const [selectedColor, setSelectedColor] = useState(null);
  const [feedback, setFeedback] = useState('Une cada destello de color con su cristal del mismo color');

  useEffect(() => {
    if (placed.red && placed.blue && placed.yellow) {
      setTimeout(() => finalizarJuego(), 1500);
    }
  }, [placed]);

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setFeedback(`Elegiste el color ${color === 'red' ? 'Rojo' : color === 'blue' ? 'Azul' : 'Amarillo'}. ¡Ahora toca el cristal del mismo color!`);
  };

  const handleNidoClick = (color) => {
    if (!selectedColor) {
      setFeedback('Primero toca uno de los destellos de abajo.');
      return;
    }

    if (selectedColor === color) {
      setPlaced(prev => ({ ...prev, [color]: true }));
      setSelectedColor(null);
      setFeedback('¡Correcto! Combinación perfecta de luz. 🔮');
    } else {
      setFeedback('Oops, los colores no coinciden. ¡Prueba otra vez!');
    }
  };

  const finalizarJuego = () => {
    console.log("Actividades de Lulú finalizadas.");
    if (onComplete) onComplete();
    else navigate('/ecoesfera/agua');
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      backgroundColor: '#f0fdfa', // Bioma de Lulú: Agua
      backgroundImage: 'linear-gradient(to bottom, #CCFBF1, #f0fdfa)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
      position: 'relative'
    }}>
      {/* Botón Volver */}
      <button 
        onClick={() => {
          if (onBack) onBack();
          else navigate('/personaje/lulu');
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

      <div style={{
        marginTop: '60px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: 'none',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        width: '90%', maxWidth: '400px',
        zIndex: 5
      }}>
        <p style={{ color: '#115E59', fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>{feedback}</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', margin: '20px 0' }}>
        <button
          onClick={() => handleNidoClick('red')}
          style={{
            width: '90px', height: '90px', border: '3px dashed #f87171',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: placed.red ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: '2.5rem', outline: 'none'
          }}
        >
          {placed.red ? '❤️' : '⬜'}
        </button>
        <button
          onClick={() => handleNidoClick('blue')}
          style={{
            width: '90px', height: '90px', border: '3px dashed #38BDF8',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: placed.blue ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: '2.5rem', outline: 'none'
          }}
        >
          {placed.blue ? '💙' : '⬜'}
        </button>
        <button
          onClick={() => handleNidoClick('yellow')}
          style={{
            width: '90px', height: '90px', border: '3px dashed #fbbf24',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: placed.yellow ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: '2.5rem', outline: 'none'
          }}
        >
          {placed.yellow ? '💛' : '⬜'}
        </button>
      </div>

      {/* Prisma de Lulú al centro */}
      <div style={{ fontSize: '5rem', margin: '10px 0', animation: 'float 4s infinite ease-in-out' }}>🔮</div>

      {/* Destellos de Luz abajo */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
        {!placed.red && (
          <button
            onClick={() => handleColorClick('red')}
            style={{
              width: '70px', height: '70px', backgroundColor: '#f87171', borderRadius: '50%',
              border: selectedColor === 'red' ? '4px solid white' : 'none',
              boxShadow: 'none', cursor: 'pointer',
              outline: 'none', transform: selectedColor === 'red' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          />
        )}
        {!placed.blue && (
          <button
            onClick={() => handleColorClick('blue')}
            style={{
              width: '70px', height: '70px', backgroundColor: '#38BDF8', borderRadius: '50%',
              border: selectedColor === 'blue' ? '4px solid white' : 'none',
              boxShadow: 'none', cursor: 'pointer',
              outline: 'none', transform: selectedColor === 'blue' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          />
        )}
        {!placed.yellow && (
          <button
            onClick={() => handleColorClick('yellow')}
            style={{
              width: '70px', height: '70px', backgroundColor: '#fbbf24', borderRadius: '50%',
              border: selectedColor === 'yellow' ? '4px solid white' : 'none',
              boxShadow: 'none', cursor: 'pointer',
              outline: 'none', transform: selectedColor === 'yellow' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          />
        )}
      </div>

  {/* Pantalla de Éxito Final */}
  {placed.red && placed.blue && placed.yellow && (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh',
      backgroundColor: 'rgba(255,255,255,0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <h1 style={{ color: '#115E59', fontSize: '3rem', margin: 0 }}>¡Destello de Verdad! 🌈</h1>
      <p style={{ color: '#0d9488', fontSize: '1.3rem', marginTop: '1rem', fontWeight: '500' }}>El prisma de Lulú ha iluminado la cueva.</p>
    </div>
  )}

      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
