import React, { useState, useEffect, useRef } from 'react';

// Nivel 1: Cap 1-5 (1 objeto evidente)
// Nivel 2: Cap 6-10 (2-3 objetos algo camuflados)
// Nivel 3: Cap 11-14 (3 objetos muy camuflados con mucho ruido visual)

const GENERATE_LEVELS = (width, height) => ({
  1: {
    instruccion: "¡Ayúdame a encontrar a la luciérnaga dorada!",
    targetEmoji: "✨",
    distractorEmojis: ["☁️", "🌱"],
    targets: [{ id: 't1', x: width * 0.5, y: height * 0.5, size: 70, found: false }],
    distractors: [
      { id: 'd1', x: width * 0.2, y: height * 0.3, size: 60, emoji: "☁️" },
      { id: 'd2', x: width * 0.8, y: height * 0.7, size: 60, emoji: "🌱" }
    ],
    bg: '#f8fafc'
  },
  2: {
    instruccion: "¡Oh no! Dos ranitas mágicas se escondieron en el estanque.",
    targetEmoji: "🐸",
    distractorEmojis: ["🍃", "🌿", "🐢", "🐊"],
    targets: [
      { id: 't1', x: width * 0.3, y: height * 0.4, size: 60, found: false },
      { id: 't2', x: width * 0.7, y: height * 0.6, size: 60, found: false }
    ],
    distractors: Array.from({ length: 15 }).map((_, i) => ({
      id: `d${i}`,
      x: width * (0.1 + Math.random() * 0.8),
      y: height * (0.1 + Math.random() * 0.8),
      size: 40 + Math.random() * 30,
      emoji: ["🍃", "🌿", "🐢", "🐊"][Math.floor(Math.random() * 4)]
    })),
    bg: '#ecfdf5' // Tono agua/verde
  },
  3: {
    instruccion: "¡Las mariposas azules se han camuflado entre las flores y gotas de rocío!",
    targetEmoji: "🦋",
    distractorEmojis: ["💧", "💠", "🐟", "🧊", "🫐"],
    targets: [
      { id: 't1', x: width * 0.2, y: height * 0.8, size: 50, found: false },
      { id: 't2', x: width * 0.5, y: height * 0.2, size: 50, found: false },
      { id: 't3', x: width * 0.8, y: height * 0.5, size: 50, found: false }
    ],
    distractors: Array.from({ length: 30 }).map((_, i) => ({
      id: `d${i}`,
      x: width * (Math.random()),
      y: height * (Math.random()),
      size: 40 + Math.random() * 20,
      emoji: ["💧", "💠", "🐟", "🧊", "🫐"][Math.floor(Math.random() * 5)]
    })),
    bg: '#eff6ff'
  },
  4: { // Preescritura: Búsqueda de Letras
    instruccion: "¡Encuentra todas las letras 'A' escondidas!",
    targetEmoji: "A",
    distractorEmojis: ["E", "O", "V", "M"],
    targets: [
      { id: 't1', x: width * 0.3, y: height * 0.3, size: 60, found: false, isText: true },
      { id: 't2', x: width * 0.7, y: height * 0.7, size: 60, found: false, isText: true },
      { id: 't3', x: width * 0.8, y: height * 0.2, size: 60, found: false, isText: true }
    ],
    distractors: Array.from({ length: 20 }).map((_, i) => ({
      id: `d${i}`,
      x: width * (0.1 + Math.random() * 0.8),
      y: height * (0.1 + Math.random() * 0.8),
      size: 40 + Math.random() * 20,
      emoji: ["E", "O", "V", "M"][Math.floor(Math.random() * 4)],
      isText: true
    })),
    bg: '#fdf4ff'
  },
  5: { // Identificación Sonido-Grafema
    instruccion: "¡Escucha con atención y toca la letra que suena! (M)",
    targetEmoji: "M",
    audioHint: "M", // Esto activaría síntesis de voz en el componente
    distractorEmojis: ["N", "P", "S", "T"],
    targets: [
      { id: 't1', x: width * 0.5, y: height * 0.5, size: 80, found: false, isText: true }
    ],
    distractors: Array.from({ length: 10 }).map((_, i) => ({
      id: `d${i}`,
      x: width * (0.1 + Math.random() * 0.8),
      y: height * (0.1 + Math.random() * 0.8),
      size: 60 + Math.random() * 20,
      emoji: ["N", "P", "S", "T"][Math.floor(Math.random() * 4)],
      isText: true
    })),
    bg: '#fffbeb'
  }
});

export default function BusquedaVisualJuego({ nivel = 1, onComplete }) {
  const [levelData, setLevelData] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef(null);

  // Metrics
  const espacialInicial = () => ({
    izquierda: { aciertos: 0, errores: 0 }, derecha: { aciertos: 0, errores: 0 },
    arriba: { aciertos: 0, errores: 0 }, abajo: { aciertos: 0, errores: 0 }
  });
  const metrics = useRef({
    startTime: 0,
    missClicks: 0,
    findTimes: [],
    espacial: espacialInicial()
  });

  // Registra en qué zona de la pantalla ocurrió cada acierto/error (telemetría clínica)
  const registrarEspacial = (x, y, exito) => {
    const container = containerRef.current;
    if (!container) return;
    const ladoH = x < container.clientWidth / 2 ? 'izquierda' : 'derecha';
    const ladoV = y < container.clientHeight / 2 ? 'arriba' : 'abajo';
    const campo = exito ? 'aciertos' : 'errores';
    metrics.current.espacial[ladoH][campo] += 1;
    metrics.current.espacial[ladoV][campo] += 1;
  };

  useEffect(() => {
    initLevel();
    window.addEventListener('resize', initLevel);
    return () => window.removeEventListener('resize', initLevel);
  }, [nivel]);

  const initLevel = () => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const levels = GENERATE_LEVELS(clientWidth, clientHeight);
      const data = levels[nivel] || levels[1];
      setLevelData(data);
      metrics.current.startTime = Date.now();
      metrics.current.missClicks = 0;
      metrics.current.findTimes = [];
      metrics.current.espacial = espacialInicial();
      setIsDone(false);

      if (data.audioHint && 'speechSynthesis' in window) {
        // Reproducir el sonido/letra
        const utterance = new SpeechSynthesisUtterance(data.audioHint);
        utterance.lang = 'es-ES';
        utterance.rate = 0.8; // Más lento para mejor comprensión
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleTargetClick = (e, tId) => {
    e.stopPropagation();
    if (isDone) return;

    const findTime = (Date.now() - metrics.current.startTime) / 1000;
    metrics.current.findTimes.push(findTime);

    const targetEncontrado = levelData.targets.find(t => t.id === tId);
    if (targetEncontrado) registrarEspacial(targetEncontrado.x, targetEncontrado.y, true);

    setLevelData(prev => {
      const newTargets = prev.targets.map(t => t.id === tId ? { ...t, found: true } : t);
      
      // Check if all found
      if (newTargets.every(t => t.found)) {
        finishGame(newTargets.length);
      }
      
      return { ...prev, targets: newTargets };
    });
  };

  const handleBackgroundClick = (e) => {
    if (!isDone) {
      metrics.current.missClicks += 1;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) registrarEspacial(e.clientX - rect.left, e.clientY - rect.top, false);
    }
  };

  const finishGame = (totalTargets) => {
    setIsDone(true);
    const totalTime = (Date.now() - metrics.current.startTime) / 1000;
    const avgTimePerTarget = totalTime / totalTargets;

    if (onComplete) {
      onComplete({
        tiempoCompletadoSegundos: totalTime,
        tiempoPromedioPorObjeto: avgTimePerTarget.toFixed(2),
        intentosFallidos: metrics.current.missClicks,
        respuestasEspaciales: metrics.current.espacial,
        nivelAsignado: nivel
      });
    }
  };

  if (!levelData) return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;

  return (
    <div 
      ref={containerRef}
      onClick={handleBackgroundClick}
      style={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        backgroundColor: levelData.bg
      }}
    >
      {/* Vani Instruction Bubble */}
      <div style={{
        position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: 20, right: 20, zIndex: 10, 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
        padding: '15px 25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.4)'
      }}>
        <div style={{ width: 50, height: 50, borderRadius: '25px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(245,158,11,0.3)', border: '2px solid white' }}>
          <img src="/vani_avatar.png" alt="Vani" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#334155', fontSize: '1rem', fontWeight: 'bold' }}>Vani</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem', lineHeight: '1.3' }}>
            {levelData.instruccion}
            {levelData.audioHint && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(levelData.audioHint);
                    utterance.lang = 'es-ES';
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                style={{
                  marginLeft: '10px', padding: '5px 10px', background: '#fde047', 
                  border: 'none', borderRadius: '15px', cursor: 'pointer',
                  fontWeight: 'bold', color: '#b45309'
                }}
              >
                🔊 Repetir Sonido
              </button>
            )}
          </p>
          <div style={{ marginTop: '5px', fontWeight: 'bold', color: '#10b981', fontSize: '0.9rem' }}>
            Encontrados: {levelData.targets.filter(t => t.found).length} / {levelData.targets.length}
          </div>
        </div>
      </div>

      {/* Render Distractors */}
      {levelData.distractors.map(d => (
        <div key={d.id} style={{
          position: 'absolute', left: d.x - d.size/2, top: d.y - d.size/2,
          width: d.size, height: d.size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${d.size * 0.7}px`, pointerEvents: 'none',
          opacity: 0.8
        }}>
          {d.emoji}
        </div>
      ))}

      {/* Render Targets */}
      {levelData.targets.map(t => {
        if (t.found) {
          // Draw a spark/particle instead of the object
          return (
            <div key={t.id} style={{
              position: 'absolute', left: t.x - t.size/2, top: t.y - t.size/2,
              width: t.size, height: t.size, borderRadius: '50%',
              backgroundColor: '#fde047', boxShadow: '0 0 30px #fde047',
              animation: 'fadeOut 1s forwards'
            }} />
          )
        }
        
        return (
          <div 
            key={t.id}
            onClick={(e) => handleTargetClick(e, t.id)}
            style={{
              position: 'absolute', left: t.x - (t.size + 40)/2, top: t.y - (t.size + 40)/2,
              width: t.size + 40, height: t.size + 40, // 40px target padding for Cero Friccion
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 5
            }}
          >
            <div style={{
              width: t.size, height: t.size,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: `${t.size * 0.8}px`,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
              animation: 'float 3s ease-in-out infinite'
            }}>
              {levelData.targetEmoji}
            </div>
          </div>
        );
      })}

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out', zIndex: 20
        }}>
          <h2 style={{color: '#10b981', margin: 0, fontSize: '2.5rem'}}>¡Excelente visión!</h2>
          <p style={{color: '#64748b', fontSize: '1.2rem', marginTop: '0.5rem'}}>Encontraste todos los objetos.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
