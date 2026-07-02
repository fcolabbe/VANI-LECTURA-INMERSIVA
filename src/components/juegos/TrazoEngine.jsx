import React, { useRef, useEffect, useState } from 'react';

// Nivel 1: Trazo Libre Guiado (ZigZag)
// Nivel 2: Copia en Cuadrícula

const PATTERNS = {
  1: {
    type: 'trace',
    path: [
      { x: 0.1, y: 0.5 }, { x: 0.3, y: 0.2 }, { x: 0.5, y: 0.8 }, { x: 0.7, y: 0.2 }, { x: 0.9, y: 0.5 }
    ],
    instruction: "Sigue el camino sin levantar el dedo"
  },
  2: {
    type: 'grid',
    gridSize: 3, // 3x3
    reference: [
      [0, 0], [1, 1], [2, 0] // Line from top-left to middle to top-right
    ],
    instruction: "Copia la figura en tu cuadrícula"
  }
};

export default function TrazoEngine({ nivel = 1, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDone, setIsDone] = useState(false);
  const [levelData, setLevelData] = useState(PATTERNS[nivel] || PATTERNS[1]);

  const metrics = useRef({
    startTime: 0,
    lifts: 0,
    deviations: [],
  });

  const state = useRef({
    isDrawing: false,
    points: [], // user drawn points
    lastPos: null
  });

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [nivel]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    metrics.current = { startTime: Date.now(), lifts: 0, deviations: [] };
    state.current = { isDrawing: false, points: [], lastPos: null };
    setIsDone(false);
    
    drawScene();
  };

  const getScaledPath = (width, height) => {
    if (levelData.type !== 'trace') return [];
    return levelData.path.map(p => ({ x: p.x * width, y: p.y * height }));
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    if (levelData.type === 'trace') {
      const path = getScaledPath(width, height);
      
      // Draw dashed guide
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 10;
      ctx.setLineDash([20, 20]);
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.4)';
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Start/End Nodes
      ctx.beginPath();
      ctx.arc(path[0].x, path[0].y, 20, 0, Math.PI*2);
      ctx.fillStyle = '#10b981'; ctx.fill();
      
      ctx.beginPath();
      ctx.arc(path[path.length - 1].x, path[path.length - 1].y, 20, 0, Math.PI*2);
      ctx.fillStyle = '#ef4444'; ctx.fill();

    } else if (levelData.type === 'grid') {
      // Draw grid
      const cols = levelData.gridSize;
      const rows = levelData.gridSize;
      const cellW = (width * 0.5) / cols;
      const cellH = (height * 0.5) / rows;
      const startX = width * 0.25;
      const startY = height * 0.3;

      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 4;

      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + r * cellH);
        ctx.lineTo(startX + cols * cellW, startY + r * cellH);
        ctx.stroke();
      }
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(startX + c * cellW, startY);
        ctx.lineTo(startX + c * cellW, startY + rows * cellH);
        ctx.stroke();
      }

      // Draw reference shape smaller at top
      const refW = cellW * 0.4;
      const refH = cellH * 0.4;
      const refStartX = width * 0.4;
      const refStartY = height * 0.05;

      ctx.beginPath();
      const refPath = levelData.reference;
      ctx.moveTo(refStartX + refPath[0][0]*refW, refStartY + refPath[0][1]*refH);
      for(let i=1; i<refPath.length; i++) {
        ctx.lineTo(refStartX + refPath[i][0]*refW, refStartY + refPath[i][1]*refH);
      }
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Draw user line
    if (state.current.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(state.current.points[0].x, state.current.points[0].y);
      for (let i = 1; i < state.current.points.length; i++) {
        ctx.lineTo(state.current.points[i].x, state.current.points[i].y);
      }
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
    }
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    if (isDone) return;
    if (e.cancelable && e.type !== 'mousedown') e.preventDefault();
    
    if (state.current.points.length === 0) {
      metrics.current.startTime = Date.now();
    } else {
      metrics.current.lifts += 1;
    }

    state.current.isDrawing = true;
    const pos = getPos(e);
    state.current.points.push(pos);
    drawScene();
  };

  const handlePointerMove = (e) => {
    if (!state.current.isDrawing || isDone) return;
    if (e.cancelable && e.type !== 'mousemove') e.preventDefault();

    const pos = getPos(e);
    state.current.points.push(pos);
    drawScene();

    // Check completion logic
    if (levelData.type === 'trace') {
      const path = getScaledPath(canvasRef.current.width, canvasRef.current.height);
      const endNode = path[path.length - 1];
      const distToEnd = Math.hypot(pos.x - endNode.x, pos.y - endNode.y);
      if (distToEnd < 40) finishGame();
    }
  };

  const handlePointerUp = () => {
    if (!state.current.isDrawing || isDone) return;
    state.current.isDrawing = false;
    
    if (levelData.type === 'grid') {
      if (state.current.points.length > 50) {
        finishGame();
      }
    }
  };

  const finishGame = () => {
    setIsDone(true);
    state.current.isDrawing = false;
    
    const timeTaken = (Date.now() - metrics.current.startTime) / 1000;
    if (onComplete) {
      onComplete({
        tiempoCompletadoSegundos: timeTaken,
        levantamientosDedo: metrics.current.lifts,
        nivelAsignado: nivel
      });
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none', backgroundColor: '#fafafa' }}
    >
      <div style={{
        position: 'absolute', top: 20, width: '100%', textAlign: 'center',
        zIndex: 10, color: '#4b5563', fontWeight: 'bold', fontSize: '1.2rem', pointerEvents: 'none'
      }}>
        {levelData.instruction}
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
      />
      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <h2 style={{color: '#f59e0b', margin: 0, fontSize: '2rem'}}>¡Excelente Trazo!</h2>
        </div>
      )}
    </div>
  );
}
