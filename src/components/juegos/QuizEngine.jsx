import React, { useState, useEffect, useRef } from 'react';

// Nivel 1: Asociación Imagen -> Texto
// Nivel 2: Asociación Texto -> Imagen
// Nivel 3: Comprensión literal de texto corto

const LEVEL_DATA = {
  1: {
    type: 'image-to-text',
    image: "🏃‍♂️💨",
    instruction: "¿Qué oración describe la imagen?",
    options: [
      { id: 'o1', text: "El niño camina lento", correct: false },
      { id: 'o2', text: "El niño corre rápido", correct: true },
      { id: 'o3', text: "El niño duerme", correct: false }
    ]
  },
  2: {
    type: 'text-to-image',
    text: "La niña lee un libro",
    instruction: "Toca la imagen correcta",
    options: [
      { id: 'o1', emoji: "📖👧", correct: true },
      { id: 'o2', emoji: "⚽👧", correct: false },
      { id: 'o3', emoji: "🍎👧", correct: false }
    ]
  },
  3: {
    type: 'short-text',
    story: "Mi perro Max tiene una pelota roja. Él juega en el jardín todo el día.",
    instruction: "¿De qué color es la pelota de Max?",
    options: [
      { id: 'o1', text: "Azul", emoji: "🔵", correct: false },
      { id: 'o2', text: "Roja", emoji: "🔴", correct: true },
      { id: 'o3', text: "Verde", emoji: "🟢", correct: false }
    ]
  }
};

export default function QuizEngine({ nivel = 1, onComplete }) {
  const [data, setData] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const metrics = useRef({ startTime: 0, errors: 0 });

  useEffect(() => {
    setData(LEVEL_DATA[nivel] || LEVEL_DATA[1]);
    setIsDone(false);
    setSelectedId(null);
    metrics.current = { startTime: Date.now(), errors: 0 };
  }, [nivel]);

  const handleOptionClick = (opt) => {
    if (isDone) return;
    
    if (opt.correct) {
      setSelectedId(opt.id);
      setIsDone(true);
      
      const timeTaken = (Date.now() - metrics.current.startTime) / 1000;
      if (onComplete) {
        setTimeout(() => {
          onComplete({
            tiempoCompletadoSegundos: timeTaken,
            errores: metrics.current.errors,
            nivelAsignado: nivel
          });
        }, 2000);
      }
    } else {
      metrics.current.errors += 1;
      // Visual feedback for error could be shaking the button, but we stick to zero-friction for now.
    }
  };

  if (!data) return <div />;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      {/* Question / Context */}
      <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px' }}>
        <h2 style={{ color: '#475569', fontSize: '1.5rem', marginBottom: '20px' }}>{data.instruction}</h2>
        
        {data.type === 'image-to-text' && (
          <div style={{ fontSize: '6rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
            {data.image}
          </div>
        )}
        
        {data.type === 'text-to-image' && (
          <div style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 'bold', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            "{data.text}"
          </div>
        )}
        
        {data.type === 'short-text' && (
          <div style={{ fontSize: '1.5rem', color: '#334155', lineHeight: '1.6', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            {data.story}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: data.type === 'text-to-image' ? 'row' : 'column', gap: '15px', width: '100%', maxWidth: '500px', justifyContent: 'center' }}>
        {data.options.map(opt => {
          const isSelectedCorrect = isDone && selectedId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt)}
              style={{
                padding: '20px', 
                backgroundColor: isSelectedCorrect ? '#10b981' : 'white',
                color: isSelectedCorrect ? 'white' : '#1e293b',
                border: 'none', borderRadius: '16px',
                fontSize: data.type === 'text-to-image' ? '4rem' : '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
                transform: isSelectedCorrect ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {opt.emoji && <span>{opt.emoji}</span>}
              {opt.text && <span>{opt.text}</span>}
            </button>
          )
        })}
      </div>

      {isDone && (
        <div style={{ marginTop: '30px', fontSize: '1.5rem', color: '#10b981', fontWeight: 'bold', animation: 'fadeIn 0.5s' }}>
          ¡Correcto!
        </div>
      )}
    </div>
  );
}
