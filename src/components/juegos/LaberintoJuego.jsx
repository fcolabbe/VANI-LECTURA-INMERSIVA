import React, { useRef, useEffect, useState } from 'react';

// Path definitions for the different levels (0 to 1 scaling, will be scaled to canvas size)
const PATHS = {
  1: [ // Level 1 (Caps 1-5): Simple straight/curved line
    { x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }
  ],
  2: [ // Level 2 (Caps 6-10): S-Curve
    { x: 0.1, y: 0.2 }, { x: 0.5, y: 0.2 }, { x: 0.5, y: 0.8 }, { x: 0.9, y: 0.8 }
  ],
  3: [ // Level 3 (Caps 11-14): Zig-Zag / Crossings
    { x: 0.1, y: 0.8 }, { x: 0.3, y: 0.2 }, { x: 0.7, y: 0.8 }, { x: 0.9, y: 0.2 }
  ]
};

const PATH_WIDTH = 60; // How wide the "safe" path is

export default function LaberintoJuego({ nivel = 1, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Telemetry
  const metrics = useRef({
    startTime: 0,
    lifts: 0,
    deviations: [], // array of distances from ideal path
  });

  const state = useRef({
    isDrawing: false,
    progress: 0, // 0 to 1 along the path
    lastPos: null,
    points: [] // user drawn points
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
    
    // Set internal resolution to match display size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    drawScene();
  };

  const getScaledPath = (width, height) => {
    const rawPath = PATHS[nivel] || PATHS[1];
    return rawPath.map(p => ({ x: p.x * width, y: p.y * height }));
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    const path = getScaledPath(width, height);
    
    // Draw base path (The labyrinth track)
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    // Track styling
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = PATH_WIDTH;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // Glassy track
    ctx.stroke();

    // Draw track inner line
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 15]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw Start Node
    ctx.beginPath();
    ctx.arc(path[0].x, path[0].y, PATH_WIDTH/2, 0, Math.PI*2);
    ctx.fillStyle = '#fde047'; // Yellow start
    ctx.fill();

    // Draw End Node
    const endNode = path[path.length - 1];
    ctx.beginPath();
    ctx.arc(endNode.x, endNode.y, PATH_WIDTH/2, 0, Math.PI*2);
    ctx.fillStyle = '#86efac'; // Green end
    ctx.fill();

    // Draw user line
    if (state.current.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(state.current.points[0].x, state.current.points[0].y);
      for (let i = 1; i < state.current.points.length; i++) {
        ctx.lineTo(state.current.points[i].x, state.current.points[i].y);
      }
      ctx.lineWidth = 15;
      ctx.strokeStyle = '#f59e0b'; // Vani golden light
      ctx.stroke();
      
      // Draw fairy dot at current position
      const last = state.current.points[state.current.points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 20, 0, Math.PI*2);
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    } else if (!isDone) {
       // Draw fairy dot at start if haven't started
       ctx.beginPath();
       ctx.arc(path[0].x, path[0].y, 20, 0, Math.PI*2);
       ctx.fillStyle = '#fde047';
       ctx.shadowColor = '#f59e0b';
       ctx.shadowBlur = 20;
       ctx.fill();
       ctx.shadowBlur = 0;
    }
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Distance from point to line segment
  const pointToLineDist = (p, v, w) => {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return Math.hypot(p.x - proj.x, p.y - proj.y);
  };

  const calculateDeviation = (pos, width, height) => {
    const path = getScaledPath(width, height);
    let minDist = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const dist = pointToLineDist(pos, path[i], path[i+1]);
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  };

  const handlePointerDown = (e) => {
    if (isDone) return;
    
    // Prevent default touch scrolling
    if (e.cancelable && e.type !== 'mousedown') e.preventDefault();
    
    if (!isPlaying) {
      setIsPlaying(true);
      metrics.current.startTime = Date.now();
    } else {
      metrics.current.lifts += 1;
    }

    state.current.isDrawing = true;
    const pos = getPos(e);
    
    // Check if clicking near the start or the last point
    const canvas = canvasRef.current;
    const path = getScaledPath(canvas.width, canvas.height);
    const startNode = state.current.points.length > 0 ? state.current.points[state.current.points.length - 1] : path[0];
    
    const distToStart = Math.hypot(pos.x - startNode.x, pos.y - startNode.y);
    
    if (distToStart < PATH_WIDTH) {
      if (state.current.points.length === 0) {
        state.current.points = [pos];
      }
      state.current.lastPos = pos;
      drawScene();
    } else {
      state.current.isDrawing = false; // didn't grab the dot
    }
  };

  const handlePointerMove = (e) => {
    if (!state.current.isDrawing || isDone) return;
    
    if (e.cancelable && e.type !== 'mousemove') e.preventDefault();

    const pos = getPos(e);
    const canvas = canvasRef.current;
    
    // Calculate deviation from ideal path
    const dev = calculateDeviation(pos, canvas.width, canvas.height);
    metrics.current.deviations.push(dev);

    // If deviated too far (e.g. outside the visible track completely), we could break the line, 
    // but Regla de Oro dice "Cero fricción". So we just let them draw but log the deviation!
    
    state.current.points.push(pos);
    drawScene();

    // Check if reached end
    const path = getScaledPath(canvas.width, canvas.height);
    const endNode = path[path.length - 1];
    const distToEnd = Math.hypot(pos.x - endNode.x, pos.y - endNode.y);
    
    if (distToEnd < PATH_WIDTH / 2) {
      finishGame();
    }
  };

  const handlePointerUp = () => {
    if (!state.current.isDrawing || isDone) return;
    state.current.isDrawing = false;
  };

  const finishGame = () => {
    setIsDone(true);
    state.current.isDrawing = false;
    
    const endTime = Date.now();
    const timeTaken = (endTime - metrics.current.startTime) / 1000;
    const avgDev = metrics.current.deviations.length > 0 
      ? metrics.current.deviations.reduce((a,b)=>a+b, 0) / metrics.current.deviations.length 
      : 0;

    const finalMetrics = {
      tiempoCompletadoSegundos: timeTaken,
      levantamientosDedo: metrics.current.lifts,
      desviacionPromedioTrazo: Math.round(avgDev),
      nivelAsignado: nivel
    };

    if (onComplete) {
      onComplete(finalMetrics);
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}
    >
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
          <h2 style={{color: '#d97706', margin: 0, fontSize: '2rem'}}>¡Mágico!</h2>
          <p style={{color: '#64748b', fontSize: '1.2rem', marginTop: '0.5rem'}}>El camino está completo.</p>
        </div>
      )}
    </div>
  );
}
