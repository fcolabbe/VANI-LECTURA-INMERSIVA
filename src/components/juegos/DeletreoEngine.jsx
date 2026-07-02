import React, { useState, useEffect, useRef } from 'react';

// Motor de Dictado/Deletreo
// Nivel 1: Palabras de 3-4 letras con ayuda visual
// Nivel 2: Dictado sin pista de texto (solo audio y huecos)

const LEVEL_DATA = {
  1: {
    word: "SOL",
    image: "☀️",
    audioHint: "Sol",
    showHint: true
  },
  2: {
    word: "CASA",
    image: "🏠",
    audioHint: "Casa",
    showHint: false
  }
};

const QWERTY = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['Z','X','C','V','B','N','M']
];

export default function DeletreoEngine({ nivel = 1, onComplete }) {
  const [data, setData] = useState(null);
  const [input, setInput] = useState("");
  const [isDone, setIsDone] = useState(false);
  
  const metrics = useRef({ startTime: 0, errors: 0 });

  useEffect(() => {
    const d = LEVEL_DATA[nivel] || LEVEL_DATA[1];
    setData(d);
    setInput("");
    setIsDone(false);
    metrics.current = { startTime: Date.now(), errors: 0 };
    
    if (d.audioHint && 'speechSynthesis' in window) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(d.audioHint);
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }, 500);
    }
  }, [nivel]);

  const handleKeyPress = (letter) => {
    if (isDone || !data) return;
    
    const expectedLetter = data.word[input.length];
    if (letter === expectedLetter) {
      const newInput = input + letter;
      setInput(newInput);
      
      if (newInput === data.word) {
        finishGame();
      }
    } else {
      metrics.current.errors += 1;
      // Provide negative feedback? (Cero Friccion: maybe just a slight shake or nothing)
    }
  };

  const finishGame = () => {
    setIsDone(true);
    const timeTaken = (Date.now() - metrics.current.startTime) / 1000;
    if (onComplete) {
      setTimeout(() => {
        onComplete({
          tiempoCompletadoSegundos: timeTaken,
          erroresOrtograficos: metrics.current.errors,
          nivelAsignado: nivel
        });
      }, 1500);
    }
  };

  if (!data) return <div />;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      {/* Visual / Audio Cue */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
          {data.image}
        </div>
        <button 
          onClick={() => {
            if ('speechSynthesis' in window) {
              const u = new SpeechSynthesisUtterance(data.audioHint);
              u.lang = 'es-ES';
              window.speechSynthesis.speak(u);
            }
          }}
          style={{ width: '60px', height: '60px', borderRadius: '30px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)' }}
        >
          🔊
        </button>
      </div>

      {/* Target Word Slots */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        {data.word.split('').map((char, i) => {
          const isFilled = i < input.length;
          const isCurrent = i === input.length;
          return (
            <div key={i} style={{
              width: '60px', height: '80px', 
              borderBottom: `4px solid ${isCurrent ? '#3b82f6' : '#d1d5db'}`,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', paddingBottom: '5px'
            }}>
              {isFilled ? char : (data.showHint && !isDone ? <span style={{color: '#e5e7eb'}}>{char}</span> : '')}
            </div>
          );
        })}
      </div>

      {/* Virtual Keyboard (High contrast, large targets) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '600px' }}>
        {QWERTY.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                style={{
                  flex: 1, height: '64px', maxWidth: '50px',
                  backgroundColor: 'white', border: 'none', borderRadius: '12px',
                  boxShadow: '0 4px 0 #e5e7eb',
                  fontSize: '1.5rem', fontWeight: 'bold', color: '#374151',
                  cursor: 'pointer', touchAction: 'manipulation'
                }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', zIndex: 200
        }}>
          <h2 style={{color: '#10b981', margin: 0, fontSize: '2.5rem'}}>¡Excelente!</h2>
          <p style={{fontSize: '1.2rem', color: '#4b5563'}}>{data.word}</p>
        </div>
      )}
    </div>
  );
}
