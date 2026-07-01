import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Sombras Mágicas (Match forma a silueta)
export default function SombrasEngine({ 
  nivel = 1, 
  onComplete 
}) {
  const containerRef = useRef(null);
  
  // Dificultad basada en el nivel:
  // Nivel 1: 3 formas muy distintas
  // Nivel 2: 4 formas
  // Nivel 3: 5 formas (algunas similares para mayor reto visual)
  const getShapesData = (l) => {
    let numItems = 3;
    if (l === 2) numItems = 4;
    if (l >= 3) numItems = 5;

    // Para el prototipo usamos Emojis. En producción se usarán imágenes PNG con transparencia (para la forma y la sombra invertida a negro)
    let emojis = ["🦋", "🐸", "🍎", "🍃", "🍄"];
    if (l >= 3) emojis = ["🍃", "🌿", "🌱", "🍀", "🪴"]; // Nivel 3: Formas similares (todas hojas/plantas)

    const shapes = [];
    for (let i = 0; i < numItems; i++) {
      shapes.push({
        id: `shape_${i}`,
        emoji: emojis[i],
      });
    }
    return shapes;
  };

  const [items, setItems] = useState([]);
  const [shadows, setShadows] = useState([]);
  const [isDone, setIsDone] = useState(false);

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
    
    const shapesData = getShapesData(nivel);
    const itemSize = Math.min(100, (clientWidth * 0.8) / shapesData.length);
    const gap = 30;
    
    const totalWidth = (itemSize * shapesData.length) + (gap * (shapesData.length - 1));
    const startX = (clientWidth - totalWidth) / 2;
    const shadowY = clientHeight * 0.25;

    // Crear Sombras (Arriba)
    const initialShadows = shapesData.map((data, i) => ({
      ...data,
      x: startX + (i * (itemSize + gap)),
      y: shadowY,
      width: itemSize,
      height: itemSize
    }));

    // Desordenar las sombras para que no estén en el mismo orden que los items de abajo
    initialShadows.sort(() => Math.random() - 0.5);
    setShadows(initialShadows);

    // Crear Items (Abajo)
    const initialItems = shapesData.map((data, i) => ({
      ...data,
      width: itemSize,
      height: itemSize,
      x: startX + (i * (itemSize + gap)),
      y: clientHeight * 0.65,
      isPlaced: false
    }));
    
    // Desordenar los items visualmente también
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
          // Check intersection with the CORRECT shadow
          const targetShadow = shadows.find(s => s.id === item.id);
          const snapDist = targetShadow.width * 0.6; // 60% de tolerancia
          
          const dist = Math.hypot((targetShadow.x + targetShadow.width/2) - (item.x + item.width/2), (targetShadow.y + targetShadow.height/2) - (item.y + item.height/2));
          
          if (dist < snapDist) {
            // Correct snap!
            return { ...item, x: targetShadow.x, y: targetShadow.y, isPlaced: true };
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
        backgroundColor: '#fff7ed', position: 'relative', overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: 20, width: '100%', textAlign: 'center',
        zIndex: 10, color: '#c2410c', fontWeight: 'bold', fontSize: '1.2rem'
      }}>
        Lleva cada objeto a su sombra
      </div>

      {/* Render Shadows (Siluetas) */}
      {shadows.map(s => (
        <div key={`shadow_${s.id}`} style={{
          position: 'absolute', left: s.x, top: s.y, width: s.width, height: s.height,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${s.width * 0.8}px`,
          filter: 'brightness(0) opacity(0.15)', // Hace que el emoji se vea negro grisáceo como una sombra
          pointerEvents: 'none'
        }}>
          {s.emoji}
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${item.width * 0.8}px`,
            filter: item.isPlaced ? 'none' : (draggingItemId === item.id ? 'drop-shadow(0 15px 15px rgba(0,0,0,0.3)) scale(1.1)' : 'drop-shadow(0 5px 5px rgba(0,0,0,0.2))'),
            cursor: item.isPlaced ? 'default' : (draggingItemId === item.id ? 'grabbing' : 'grab'),
            zIndex: item.isPlaced ? 1 : (draggingItemId === item.id ? 100 : 10),
            transition: draggingItemId === item.id ? 'none' : 'transform 0.2s ease-out, filter 0.2s',
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
          <h2 style={{color: '#ea580c', margin: 0, fontSize: '2.5rem'}}>¡Asombroso!</h2>
          <p style={{color: '#9a3412', fontSize: '1.2rem', marginTop: '0.5rem'}}>Encontraste todas las sombras mágicas.</p>
        </div>
      )}
    </div>
  );
}
