import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Busca Diferencias
export default function DiferenciasEngine({ 
  nivel = 1, 
  imageSrc = '/leo_cuento1_1.png', // Imagen base
  onComplete 
}) {
  const containerRef = useRef(null);
  
  // Dificultad basada en el nivel:
  // Nivel 1: 1 diferencia evidente
  // Nivel 2: 2 diferencias medias
  // Nivel 3: 3 diferencias sutiles
  const getDifferencesData = (l) => {
    switch(l) {
      case 1: return [
        { id: 'diff1', top: '40%', left: '30%', size: '60px', color: '#f59e0b', found: false, emoji: '🌺' } // Obvio
      ];
      case 2: return [
        { id: 'diff1', top: '20%', left: '50%', size: '40px', color: '#3b82f6', found: false, emoji: '🦋' },
        { id: 'diff2', top: '70%', left: '20%', size: '40px', color: '#10b981', found: false, emoji: '🐸' }
      ];
      case 3: return [
        { id: 'diff1', top: '15%', left: '75%', size: '30px', color: '#3b82f6', found: false, emoji: '💧' },
        { id: 'diff2', top: '80%', left: '40%', size: '30px', color: '#10b981', found: false, emoji: '🍃' },
        { id: 'diff3', top: '55%', left: '85%', size: '30px', color: '#f59e0b', found: false, emoji: '🍂' } // Camuflado
      ];
      default: return [];
    }
  };

  const [differences, setDifferences] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });

  // Telemetry
  const metrics = useRef({
    startTime: 0,
    missClicks: 0
  });

  useEffect(() => {
    initEngine();
    window.addEventListener('resize', initEngine);
    return () => window.removeEventListener('resize', initEngine);
  }, [nivel, imageSrc]);

  const initEngine = () => {
    if (!containerRef.current) return;
    
    // Calculamos el tamaño del tablero basado en la pantalla.
    // Queremos dos imágenes una al lado de la otra, por lo que el ancho disponible se divide por 2,
    // o calculamos en base a la altura.
    const { clientWidth, clientHeight } = containerRef.current;
    
    // Altura al 45% de la pantalla para que quepan bien
    const maxBoardHeight = clientHeight * 0.45;
    // Asumimos aspecto 16:9
    const boardW = maxBoardHeight * (16/9); 
    const boardH = maxBoardHeight;
    
    setBoardSize({ w: boardW, h: boardH });
    setDifferences(getDifferencesData(nivel));
    setIsDone(false);
    metrics.current = { startTime: Date.now(), missClicks: 0 };
  };

  const handleDifferenceClick = (e, id) => {
    e.stopPropagation(); // Evitar contar como miss click
    if (isDone) return;

    setDifferences(prev => {
      const newDiffs = prev.map(d => d.id === id ? { ...d, found: true } : d);
      
      if (newDiffs.every(d => d.found)) {
        handleFinishGame();
      }
      return newDiffs;
    });
  };

  const handleBackgroundClick = () => {
    if (!isDone) {
      metrics.current.missClicks += 1;
    }
  };

  const handleFinishGame = () => {
    setIsDone(true);
    const totalTime = (Date.now() - metrics.current.startTime) / 1000;
    
    if (onComplete) {
      onComplete({
        tiempoCompletadoSegundos: totalTime,
        intentosFallidos: metrics.current.missClicks,
        nivelAsignado: nivel
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%', height: '100%', 
        backgroundColor: '#f1f5f9',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute', top: 20, zIndex: 10, 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
        padding: '10px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        fontWeight: 'bold', color: '#334155', fontSize: '1.2rem', border: '1px solid #e2e8f0'
      }}>
        Encuentra las {differences.length} diferencias en la imagen de la derecha
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Imagen Original (Izquierda) */}
        <div style={{
          width: boardSize.w, height: boardSize.h,
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: '4px solid white', overflow: 'hidden'
        }} />

        {/* Imagen Modificada (Derecha) */}
        <div 
          onClick={handleBackgroundClick}
          style={{
            width: boardSize.w, height: boardSize.h,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '4px solid white', position: 'relative', overflow: 'hidden',
            cursor: 'crosshair'
          }}
        >
          {/* Renderizar Diferencias (prototipo simulado usando overlays en vez de modificar la imagen base real) */}
          {differences.map(d => (
            <div 
              key={d.id}
              onClick={(e) => handleDifferenceClick(e, d.id)}
              style={{
                position: 'absolute', top: d.top, left: d.left,
                width: d.size, height: d.size,
                transform: 'translate(-50%, -50%)',
                // Si la encontró, mostramos un círculo verde de "encontrado", si no, mostramos la diferencia simulada (ej. un emoji que no está en la original)
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: `calc(${d.size} * 0.7)`,
                borderRadius: '50%',
                border: d.found ? '3px solid #10b981' : 'none',
                backgroundColor: d.found ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                boxShadow: d.found ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {!d.found && d.emoji}
              {d.found && <span style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out', zIndex: 200
        }}>
          <h2 style={{color: '#10b981', margin: 0, fontSize: '2.5rem'}}>¡Gran Observador!</h2>
          <p style={{color: '#64748b', fontSize: '1.2rem', marginTop: '0.5rem'}}>Encontraste todas las diferencias.</p>
        </div>
      )}
    </div>
  );
}
