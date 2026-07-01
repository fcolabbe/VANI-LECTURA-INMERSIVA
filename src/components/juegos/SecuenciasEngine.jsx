import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Ordenar Secuencias
export default function SecuenciasEngine({ 
  nivel = 1, 
  onComplete 
}) {
  const containerRef = useRef(null);
  
  // Dificultad basada en el nivel:
  // Nivel 1: 3 viñetas muy distintas
  // Nivel 2: 4 viñetas
  // Nivel 3: 5 viñetas o detalles sutiles
  const getSequenceData = (l) => {
    // Por ahora usamos emojis y colores como viñetas para el prototipo
    let numItems = 3;
    if (l === 2) numItems = 4;
    if (l >= 3) numItems = 5;

    const sequence = [];
    const emojis = ["🌱", "🌿", "🪴", "🌳", "🍎"];
    const colors = ["#fef3c7", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80"];

    for (let i = 0; i < numItems; i++) {
      sequence.push({
        id: `seq_${i}`,
        correctOrder: i,
        emoji: emojis[i],
        color: colors[i]
      });
    }
    return sequence;
  };

  const [items, setItems] = useState([]);
  const [slots, setSlots] = useState([]); // Los huecos en la línea de tiempo
  const [isDone, setIsDone] = useState(false);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });

  // Drag & Drop
  const [draggingItemId, setDraggingItemId] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Telemetry
  const metrics = useRef({
    startTime: 0,
    missDrops: 0
  });

  useEffect(() => {
    initEngine();
    window.addEventListener('resize', initEngine);
    return () => window.removeEventListener('resize', initEngine);
  }, [nivel]);

  const initEngine = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    const sequenceData = getSequenceData(nivel);
    
    // Configurar slots (Huecos) centrados horizontalmente
    const slotWidth = Math.min(150, (clientWidth * 0.8) / sequenceData.length);
    const slotHeight = slotWidth * 1.2;
    const gap = 20;
    
    const totalSlotsWidth = (slotWidth * sequenceData.length) + (gap * (sequenceData.length - 1));
    const startX = (clientWidth - totalSlotsWidth) / 2;
    const slotY = clientHeight * 0.2; // 20% from top

    const initialSlots = sequenceData.map((_, i) => ({
      id: `slot_${i}`,
      order: i,
      x: startX + (i * (slotWidth + gap)),
      y: slotY,
      width: slotWidth,
      height: slotHeight
    }));
    
    setSlots(initialSlots);

    // Configurar items desordenados en la parte inferior
    const initialItems = sequenceData.map((data, i) => {
      // Posición aleatoria en la parte inferior (60% al 80% de la altura)
      const randomX = Math.random() * (clientWidth - slotWidth * 1.5) + (slotWidth * 0.25);
      const randomY = clientHeight * 0.6 + Math.random() * (clientHeight * 0.2);

      return {
        ...data,
        width: slotWidth,
        height: slotHeight,
        x: randomX,
        y: randomY,
        isPlaced: false,
        currentSlot: null
      };
    });

    // Desordenar visualmente
    initialItems.sort(() => Math.random() - 0.5);
    setItems(initialItems);
    setIsDone(false);
    metrics.current = { startTime: Date.now(), missDrops: 0 };
  };

  const startDrag = (e, item) => {
    if (item.isPlaced || isDone) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    dragOffset.current = {
      x: clientX - item.x,
      y: clientY - item.y
    };
    setDraggingItemId(item.id);
  };

  const moveDrag = (e) => {
    if (!draggingItemId || isDone) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    setItems(prev => prev.map(item => {
      if (item.id === draggingItemId) {
        return {
          ...item,
          x: clientX - dragOffset.current.x,
          y: clientY - dragOffset.current.y
        };
      }
      return item;
    }));
  };

  const stopDrag = () => {
    if (!draggingItemId || isDone) return;
    
    setItems(prev => {
      let isGameComplete = true;
      let wasMiss = false;

      const newItems = prev.map(item => {
        if (item.id === draggingItemId) {
          // Check intersection with the CORRECT slot
          const targetSlot = slots.find(s => s.order === item.correctOrder);
          const snapDist = targetSlot.width * 0.5; // 50% de tolerancia
          
          const dist = Math.hypot((targetSlot.x + targetSlot.width/2) - (item.x + item.width/2), (targetSlot.y + targetSlot.height/2) - (item.y + item.height/2));
          
          if (dist < snapDist) {
            // Correct snap!
            return { ...item, x: targetSlot.x, y: targetSlot.y, isPlaced: true, currentSlot: targetSlot.id };
          } else {
            wasMiss = true;
            isGameComplete = false;
            return item;
          }
        }
        if (!item.isPlaced) isGameComplete = false;
        return item;
      });

      if (wasMiss) metrics.current.missDrops += 1;
      if (isGameComplete) handleFinishGame();
      
      return newItems;
    });

    setDraggingItemId(null);
  };

  const handleFinishGame = () => {
    setIsDone(true);
    const totalTime = (Date.now() - metrics.current.startTime) / 1000;
    if (onComplete) {
      onComplete({
        tiempoCompletadoSegundos: totalTime,
        intentosFallidos: metrics.current.missDrops,
        nivelAsignado: nivel
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
      style={{
        width: '100%', height: '100%', 
        backgroundColor: '#faf5ff', position: 'relative', overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: 20, width: '100%', textAlign: 'center',
        zIndex: 10, color: '#6b21a8', fontWeight: 'bold', fontSize: '1.2rem'
      }}>
        Ordena la historia (arrastra al hueco correcto)
      </div>

      {/* Render Slots */}
      {slots.map((s, i) => (
        <div key={s.id} style={{
          position: 'absolute', left: s.x, top: s.y, width: s.width, height: s.height,
          backgroundColor: 'rgba(0,0,0,0.05)', border: '3px dashed #d8b4fe',
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d8b4fe', fontSize: '2rem', fontWeight: 'bold'
        }}>
          {i + 1}
        </div>
      ))}

      {/* Render Items */}
      {items.map(item => (
        <div
          key={item.id}
          onPointerDown={(e) => startDrag(e, item)}
          style={{
            position: 'absolute', left: 0, top: 0, width: item.width, height: item.height,
            transform: `translate(${item.x}px, ${item.y}px)`,
            backgroundColor: item.color, borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem',
            boxShadow: item.isPlaced ? '0 4px 10px rgba(0,0,0,0.1)' : (draggingItemId === item.id ? '0 15px 30px rgba(0,0,0,0.2)' : '0 8px 20px rgba(0,0,0,0.15)'),
            border: '4px solid white', cursor: item.isPlaced ? 'default' : (draggingItemId === item.id ? 'grabbing' : 'grab'),
            zIndex: item.isPlaced ? 1 : (draggingItemId === item.id ? 100 : 10),
            transition: draggingItemId === item.id ? 'none' : 'transform 0.2s ease-out, box-shadow 0.2s',
          }}
        >
          {item.emoji}
        </div>
      ))}

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out', zIndex: 200
        }}>
          <h2 style={{color: '#9333ea', margin: 0, fontSize: '2.5rem'}}>¡Historia Completa!</h2>
          <p style={{color: '#6b21a8', fontSize: '1.2rem', marginTop: '0.5rem'}}>Ordenaste los eventos perfectamente.</p>
        </div>
      )}
    </div>
  );
}
