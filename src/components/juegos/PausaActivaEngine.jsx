import React, { useState, useEffect, useRef } from 'react';

const LEVEL_DATA = {
  1: {
    text: "Había una vez un perro muy feliz que corría por el bosque. Le gustaba mucho jugar con las mariposas amarillas.",
    pauses: [5, 14] // Índices de las palabras donde se pausará
  }
};

export default function PausaActivaEngine({ nivel = 1, onComplete }) {
  const [data, setData] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const metrics = useRef({ startTime: 0, errors: 0, reactionTimes: [] });
  const pauseStartTime = useRef(0);
  const readingInterval = useRef(null);

  useEffect(() => {
    const level = LEVEL_DATA[nivel] || LEVEL_DATA[1];
    setData(level);
    setWords(level.text.split(' '));
    setCurrentIndex(-1);
    setIsPaused(false);
    setIsDone(false);
    metrics.current = { startTime: Date.now(), errors: 0, reactionTimes: [] };
    
    // Start reading after a short delay
    setTimeout(() => {
      startReading();
    }, 1000);

    return () => clearInterval(readingInterval.current);
  }, [nivel]);

  const startReading = () => {
    readingInterval.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        
        // Check if we hit a pause point
        if (data && data.pauses.includes(next)) {
          clearInterval(readingInterval.current);
          setIsPaused(true);
          pauseStartTime.current = Date.now();
          return next;
        }

        // Check if finished
        if (next >= words.length) {
          clearInterval(readingInterval.current);
          finishGame();
          return prev;
        }

        return next;
      });
    }, 600); // 600ms per word reading speed
  };

  const handleWordClick = (index) => {
    if (!isPaused || isDone) return;
    
    if (index === currentIndex) {
      // Correct!
      const reaction = (Date.now() - pauseStartTime.current) / 1000;
      metrics.current.reactionTimes.push(reaction);
      
      setIsPaused(false);
      startReading();
    } else {
      // Incorrect
      metrics.current.errors += 1;
    }
  };

  const finishGame = () => {
    setIsDone(true);
    const timeTaken = (Date.now() - metrics.current.startTime) / 1000;
    const avgReaction = metrics.current.reactionTimes.length > 0 
      ? metrics.current.reactionTimes.reduce((a,b)=>a+b, 0) / metrics.current.reactionTimes.length 
      : 0;

    if (onComplete) {
      setTimeout(() => {
        onComplete({
          tiempoCompletadoSegundos: timeTaken,
          errores: metrics.current.errors,
          tiempoReaccionPromedio: avgReaction.toFixed(2),
          nivelAsignado: nivel
        });
      }, 1500);
    }
  };

  if (!data) return <div />;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#fef2f2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', fontWeight: 'bold', color: '#7f1d1d', fontSize: '1.2rem', zIndex: 10 }}>
        Sigue la lectura. Cuando se detenga, toca la última palabra iluminada.
      </div>

      <div style={{ 
        maxWidth: '700px', 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        display: 'flex', flexWrap: 'wrap', gap: '10px 15px',
        justifyContent: 'center'
      }}>
        {words.map((word, i) => {
          const isHighlighted = i === currentIndex;
          const isPast = i < currentIndex;
          
          return (
            <span
              key={i}
              onClick={() => handleWordClick(i)}
              style={{
                fontSize: '2rem',
                color: isHighlighted ? '#b91c1c' : (isPast ? '#9ca3af' : '#1f2937'),
                backgroundColor: isHighlighted ? '#fecaca' : 'transparent',
                padding: '5px 10px',
                borderRadius: '8px',
                cursor: isPaused ? 'pointer' : 'default',
                transition: 'all 0.2s',
                transform: isHighlighted && isPaused ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isHighlighted && isPaused ? '0 4px 10px rgba(220,38,38,0.2)' : 'none'
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {isDone && (
        <div style={{ marginTop: '30px', fontSize: '1.5rem', color: '#b91c1c', fontWeight: 'bold', animation: 'fadeIn 0.5s' }}>
          ¡Lectura Completada!
        </div>
      )}
    </div>
  );
}
