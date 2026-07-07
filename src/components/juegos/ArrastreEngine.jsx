import React, { useState, useEffect, useRef } from 'react';

// Nivel 1: Categorización Semántica (Arrastrar objetos a 2 canastas)
// Nivel 2: Ordenación de Oraciones (Arrastrar palabras)

const LEVEL_DATA = {
  1: {
    type: 'categorization',
    instruction: "Separa los animales del agua y de la tierra",
    zones: [
      { id: 'z1', label: '🌊 Agua', color: '#bfdbfe', accepts: ['agua'] },
      { id: 'z2', label: '🌳 Tierra', color: '#bbf7d0', accepts: ['tierra'] }
    ],
    items: [
      { id: 'i1', label: '🐟', type: 'agua' },
      { id: 'i2', label: '🐶', type: 'tierra' },
      { id: 'i3', label: '🦈', type: 'agua' },
      { id: 'i4', label: '🐰', type: 'tierra' }
    ]
  },
  2: {
    type: 'sentence',
    instruction: "Ordena las palabras para formar la frase",
    targetSentence: "El perro come hueso",
    items: [
      { id: 'i1', label: 'hueso', correctOrder: 3 },
      { id: 'i2', label: 'perro', correctOrder: 1 },
      { id: 'i3', label: 'come', correctOrder: 2 },
      { id: 'i4', label: 'El', correctOrder: 0 }
    ]
  }
};

export default function ArrastreEngine({ nivel = 1, onComplete }) {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const espacialInicial = () => ({
    izquierda: { aciertos: 0, errores: 0 }, derecha: { aciertos: 0, errores: 0 },
    arriba: { aciertos: 0, errores: 0 }, abajo: { aciertos: 0, errores: 0 }
  });
  const metrics = useRef({ startTime: 0, missDrops: 0, espacial: espacialInicial() });

  // Registra dónde ocurrió cada intento (lateralidad y eje vertical) para la telemetría clínica
  const registrarEspacial = (x, y, exito) => {
    const container = containerRef.current;
    if (!container) return;
    const ladoH = x < container.clientWidth / 2 ? 'izquierda' : 'derecha';
    const ladoV = y < container.clientHeight / 2 ? 'arriba' : 'abajo';
    const campo = exito ? 'aciertos' : 'errores';
    metrics.current.espacial[ladoH][campo] += 1;
    metrics.current.espacial[ladoV][campo] += 1;
  };
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    initEngine();
    window.addEventListener('resize', initEngine);
    return () => window.removeEventListener('resize', initEngine);
  }, [nivel]);

  const initEngine = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    const level = LEVEL_DATA[nivel] || LEVEL_DATA[1];
    setData(level);

    // Setup initial positions
    const newItems = level.items.map((item, i) => {
      let x, y;
      if (level.type === 'categorization') {
        x = (clientWidth / 2) - 100 + (i % 2) * 80;
        y = clientHeight * 0.7 + (Math.floor(i / 2) * 80);
      } else {
        x = 50 + i * 100;
        y = clientHeight * 0.7;
      }
      return {
        ...item,
        x, y,
        placed: false,
        width: 80, height: 80
      };
    });

    setItems(newItems);
    metrics.current = { startTime: Date.now(), missDrops: 0, espacial: espacialInicial() };
    setIsDone(false);
  };

  const startDrag = (e, item) => {
    if (item.placed || isDone) return;
    const cx = e.clientX || e.touches[0].clientX;
    const cy = e.clientY || e.touches[0].clientY;
    dragOffset.current = { x: cx - item.x, y: cy - item.y };
    setDraggingId(item.id);
  };

  const moveDrag = (e) => {
    if (!draggingId || isDone) return;
    const cx = e.clientX || e.touches[0].clientX;
    const cy = e.clientY || e.touches[0].clientY;
    setItems(prev => prev.map(i => i.id === draggingId ? { ...i, x: cx - dragOffset.current.x, y: cy - dragOffset.current.y } : i));
  };

  const stopDrag = () => {
    if (!draggingId || isDone) return;
    
    const container = containerRef.current;
    if (!container) return;

    setItems(prev => {
      let miss = false;
      let complete = true;
      let dropPoint = null;
      const newItems = prev.map(item => {
        if (item.id === draggingId) {
          dropPoint = { x: item.x + item.width / 2, y: item.y + item.height / 2 };
          if (data.type === 'categorization') {
            // Check intersection with zones (zones are hardcoded to upper half)
            const zoneWidth = container.clientWidth / data.zones.length;
            const zoneIndex = Math.floor((item.x + item.width/2) / zoneWidth);
            const isInUpperHalf = item.y < container.clientHeight * 0.5;

            if (isInUpperHalf && data.zones[zoneIndex] && data.zones[zoneIndex].accepts.includes(item.type)) {
              return { ...item, placed: true, x: (zoneIndex * zoneWidth) + zoneWidth/2 - item.width/2, y: container.clientHeight * 0.25 };
            } else {
              miss = true;
            }
          } else if (data.type === 'sentence') {
            // Check if dropped in the slot zone (top row)
            const slotWidth = 100;
            const startX = (container.clientWidth - (data.items.length * slotWidth)) / 2;
            if (item.y < container.clientHeight * 0.5) {
              const targetX = startX + item.correctOrder * slotWidth;
              if (Math.abs(item.x - targetX) < 50) {
                return { ...item, placed: true, x: targetX, y: container.clientHeight * 0.3 };
              } else {
                miss = true;
              }
            }
          }
        }
        if (!item.placed && item.id !== draggingId) complete = false;
        // The one we just placed might make it complete
        if (item.id === draggingId && !item.placed && !miss) { /* it got placed */ } 
        else if (item.id === draggingId && !item.placed) { complete = false; }
        return item;
      });

      if (miss) metrics.current.missDrops += 1;
      if (dropPoint) registrarEspacial(dropPoint.x, dropPoint.y, !miss);

      const allPlaced = newItems.every(i => i.placed);
      if (allPlaced) {
        finishGame();
      }
      return newItems;
    });

    setDraggingId(null);
  };

  const finishGame = () => {
    setIsDone(true);
    const timeTaken = (Date.now() - metrics.current.startTime) / 1000;
    if (onComplete) {
      onComplete({
        tiempoCompletadoSegundos: timeTaken,
        intentosFallidos: metrics.current.missDrops,
        respuestasEspaciales: metrics.current.espacial,
        nivelAsignado: nivel
      });
    }
  };

  if (!data) return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;

  return (
    <div 
      ref={containerRef}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
      style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f3f4f6', touchAction: 'none', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', fontWeight: 'bold', color: '#374151', fontSize: '1.2rem', zIndex: 10 }}>
        {data.instruction}
      </div>

      {data.type === 'categorization' && data.zones.map((z, i) => (
        <div key={z.id} style={{
          position: 'absolute', left: `${(i / data.zones.length) * 100}%`, top: 0,
          width: `${100 / data.zones.length}%`, height: '50%',
          backgroundColor: z.color, opacity: 0.5, borderRight: '2px solid white',
          display: 'flex', justifyContent: 'center', paddingTop: '60px',
          fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937'
        }}>
          {z.label}
        </div>
      ))}

      {data.type === 'sentence' && (
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '100px', borderBottom: '4px dashed #9ca3af',
          display: 'flex', justifyContent: 'space-between'
        }} />
      )}

      {items.map(item => (
        <div
          key={item.id}
          onPointerDown={(e) => startDrag(e, item)}
          style={{
            position: 'absolute', left: 0, top: 0,
            width: item.width, height: item.height,
            transform: `translate(${item.x}px, ${item.y}px)`,
            backgroundColor: 'white', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: data.type === 'categorization' ? '3rem' : '1.2rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: item.placed ? 'default' : 'grab',
            zIndex: draggingId === item.id ? 100 : 10,
            userSelect: 'none'
          }}
        >
          {item.label}
        </div>
      ))}

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', zIndex: 200
        }}>
          <h2 style={{color: '#10b981', margin: 0, fontSize: '2rem'}}>¡Bien hecho!</h2>
        </div>
      )}
    </div>
  );
}
