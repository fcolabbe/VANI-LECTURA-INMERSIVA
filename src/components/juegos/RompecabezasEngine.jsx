import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Rompecabezas.
// Recibe una imagen (src) y la corta en gridCols x gridRows pedazos.
export default function RompecabezasEngine({ 
  nivel = 1, 
  imageSrc = '/leo_cuento1_1.png', // Fallback a una imagen existente de la app
  onComplete 
}) {
  const containerRef = useRef(null);
  
  // Dificultad basada en el nivel:
  // Nivel 1: 2x2 (4 piezas)
  // Nivel 2: 3x2 (6 piezas)
  // Nivel 3: 3x3 (9 piezas)
  // Nivel 4: 4x3 (12 piezas)
  const getGridConfig = (l) => {
    switch(l) {
      case 1: return { cols: 2, rows: 2 };
      case 2: return { cols: 3, rows: 2 };
      case 3: return { cols: 3, rows: 3 };
      default: return { cols: 4, rows: 3 };
    }
  };

  const { cols, rows } = getGridConfig(nivel);
  const totalPieces = cols * rows;

  const [pieces, setPieces] = useState([]);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const [isDone, setIsDone] = useState(false);

  // Telemetry
  const metrics = useRef({
    startTime: 0,
    missDrops: 0, // Veces que soltó la pieza en el lugar equivocado
  });

  // Estado para el Drag & Drop manual (Cero fricción, sin HTML5 D&D que falla en tablets)
  const [draggingPieceId, setDraggingPieceId] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    initPuzzle();
    window.addEventListener('resize', initPuzzle);
    return () => window.removeEventListener('resize', initPuzzle);
  }, [nivel, imageSrc]);

  const initPuzzle = () => {
    if (!containerRef.current) return;
    
    // Calculamos el tamaño del tablero basado en la pantalla, 
    // dejando espacio para las piezas desordenadas abajo o al lado.
    const { clientWidth, clientHeight } = containerRef.current;
    
    // El tablero de destino será el 50% de la altura de la pantalla
    const maxBoardHeight = clientHeight * 0.55;
    // Asumimos aspecto 16:9 de las ilustraciones originales
    const boardW = maxBoardHeight * (16/9); 
    const boardH = maxBoardHeight;
    
    setBoardSize({ w: boardW, h: boardH });
    
    const pieceW = boardW / cols;
    const pieceH = boardH / rows;

    // Generar piezas iniciales
    const newPieces = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `p_${r}_${c}`;
        // Target position in the grid
        const targetX = c * pieceW;
        const targetY = r * pieceH;
        
        // Random starting position (at the bottom area of the screen)
        // X: somewhere in the width of the screen (minus piece width)
        // Y: somewhere below the board (clientHeight - pieceHeight)
        const startX = Math.random() * (clientWidth - pieceW * 1.5) + pieceW * 0.25;
        const startY = boardH + 40 + Math.random() * (clientHeight - boardH - pieceH - 60);

        newPieces.push({
          id, r, c,
          bgPosX: -targetX,
          bgPosY: -targetY,
          width: pieceW,
          height: pieceH,
          x: startX,
          y: startY,
          targetX,
          targetY,
          isPlaced: false
        });
      }
    }
    
    // Desordenar Z-index inicial aleatorio
    newPieces.sort(() => Math.random() - 0.5);
    setPieces(newPieces);
    
    setIsDone(false);
    metrics.current = { startTime: Date.now(), missDrops: 0 };
  };

  const startDrag = (e, piece) => {
    if (piece.isPlaced || isDone) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Guardamos el offset desde donde agarró la pieza
    dragOffset.current = {
      x: clientX - piece.x,
      y: clientY - piece.y
    };
    
    setDraggingPieceId(piece.id);
  };

  const moveDrag = (e) => {
    if (!draggingPieceId || isDone) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    setPieces(prev => prev.map(p => {
      if (p.id === draggingPieceId) {
        return {
          ...p,
          x: clientX - dragOffset.current.x,
          y: clientY - dragOffset.current.y
        };
      }
      return p;
    }));
  };

  const stopDrag = () => {
    if (!draggingPieceId || isDone) return;
    
    // Verificamos si la pieza está cerca de su targetX/targetY (Snap magnético)
    setPieces(prev => {
      let isCompleted = true;
      let snapOcurred = false;
      let wasMiss = false;

      const newPieces = prev.map(p => {
        if (p.id === draggingPieceId) {
          const snapDistance = Math.max(p.width, p.height) * 0.3; // 30% tolerance for cero friccion
          const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
          
          if (dist < snapDistance) {
            // SNAP!
            snapOcurred = true;
            return { ...p, x: p.targetX, y: p.targetY, isPlaced: true };
          } else {
            // No hizo snap
            wasMiss = true;
            isCompleted = false;
            return p;
          }
        }
        if (!p.isPlaced) isCompleted = false;
        return p;
      });

      if (wasMiss) {
        metrics.current.missDrops += 1;
      }

      if (isCompleted) {
        handleFinishGame();
      }

      return newPieces;
    });

    setDraggingPieceId(null);
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
        backgroundColor: '#f8fafc',
        position: 'relative', overflow: 'hidden',
        touchAction: 'none' // Previene scroll en móviles
      }}
    >
      {/* Tablero Objetivo */}
      {boardSize.w > 0 && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: boardSize.w,
          height: boardSize.h,
          backgroundColor: 'rgba(0,0,0,0.05)',
          border: '3px dashed #cbd5e1',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Guía muy tenue de la imagen de fondo para Niveles 1 y 2 */}
          {nivel <= 2 && (
            <img src={imageSrc} alt="Guía" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
          )}
        </div>
      )}

      {/* Piezas */}
      <div style={{
        position: 'absolute',
        top: 20, // Alinear container de piezas con el tablero
        left: '50%',
        transform: 'translateX(-50%)',
        width: boardSize.w,
        height: boardSize.h,
      }}>
        {pieces.map(p => (
          <div
            key={p.id}
            onPointerDown={(e) => startDrag(e, p)}
            style={{
              position: 'absolute',
              width: p.width,
              height: p.height,
              transform: `translate(${p.x}px, ${p.y}px)`,
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: `${boardSize.w}px ${boardSize.h}px`,
              backgroundPosition: `${p.bgPosX}px ${p.bgPosY}px`,
              boxShadow: p.isPlaced ? 'none' : (draggingPieceId === p.id ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.15)'),
              borderRadius: p.isPlaced ? '0' : '8px', // Bordes redondeados mientas no está encajada
              border: p.isPlaced ? 'none' : '2px solid white',
              cursor: p.isPlaced ? 'default' : (draggingPieceId === p.id ? 'grabbing' : 'grab'),
              zIndex: p.isPlaced ? 1 : (draggingPieceId === p.id ? 100 : 10),
              transition: draggingPieceId === p.id ? 'none' : 'transform 0.2s ease-out, box-shadow 0.2s, border-radius 0.3s',
            }}
          />
        ))}
      </div>

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out', zIndex: 200
        }}>
          <h2 style={{color: '#10b981', margin: 0, fontSize: '2.5rem'}}>¡Obra de Arte Completada!</h2>
          <p style={{color: '#64748b', fontSize: '1.2rem', marginTop: '0.5rem'}}>El recuerdo está en su lugar.</p>
        </div>
      )}
    </div>
  );
}
