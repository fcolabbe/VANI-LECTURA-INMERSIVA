import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Descubrimiento (Wipe/Scratch Card)
export default function RevealEngine({ 
  nivel = 1, 
  imageSrc = '/personaje_cuento0.png',
  onComplete 
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isDone, setIsDone] = useState(false);
  const [percentCleared, setPercentCleared] = useState(0);

  // Dificultad
  // Nivel 1: brocha muy grande, 40% limpia para ganar
  // Nivel 2: brocha mediana, 60% limpia
  // Nivel 3: brocha fina, 80% limpia
  const getBrushSize = () => {
    if (nivel === 1) return 80;
    if (nivel === 2) return 50;
    return 30;
  };
  
  const getTargetPercent = () => {
    if (nivel === 1) return 0.4;
    if (nivel === 2) return 0.6;
    return 0.8;
  };

  // Telemetry
  const metrics = useRef({
    startTime: 0,
    missClicks: 0 // No aplica mucho aquí, pero lo mantenemos por consistencia
  });
  
  const isDrawing = useRef(false);
  const ctx = useRef(null);

  useEffect(() => {
    initEngine();
    window.addEventListener('resize', initEngine);
    return () => window.removeEventListener('resize', initEngine);
  }, [nivel, imageSrc]);

  const initEngine = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    const canvas = canvasRef.current;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
    
    const context = canvas.getContext('2d', { willReadFrequently: true });
    ctx.current = context;
    
    // Fill with solid color or "fog"
    context.fillStyle = '#cbd5e1'; // Capa gris/niebla
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configurar composite operation para borrar
    context.globalCompositeOperation = 'destination-out';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = getBrushSize();

    setIsDone(false);
    setPercentCleared(0);
    metrics.current = { startTime: Date.now(), missClicks: 0 };
  };

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (isDone) return;
    isDrawing.current = true;
    const { x, y } = getPointerPos(e);
    ctx.current.beginPath();
    ctx.current.moveTo(x, y);
    // Draw a single dot in case of just a tap
    ctx.current.lineTo(x + 0.1, y + 0.1);
    ctx.current.stroke();
  };

  const draw = (e) => {
    if (!isDrawing.current || isDone) return;
    const { x, y } = getPointerPos(e);
    ctx.current.lineTo(x, y);
    ctx.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    ctx.current.closePath();
    checkPercentCleared();
  };

  const checkPercentCleared = () => {
    if (isDone) return;
    
    // Para no bloquear el UI analizando cada pixel, revisamos un sub-muestreo
    const canvas = canvasRef.current;
    const context = ctx.current;
    
    // Solo revisamos 1 de cada 100 píxeles para performance
    const stride = 10;
    let transparentPixels = 0;
    let totalPixelsChecked = 0;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < canvas.height; y += stride) {
      for (let x = 0; x < canvas.width; x += stride) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha < 50) {
          transparentPixels++;
        }
        totalPixelsChecked++;
      }
    }
    
    const percent = transparentPixels / totalPixelsChecked;
    setPercentCleared(percent);
    
    if (percent >= getTargetPercent()) {
      handleFinishGame();
    }
  };

  const handleFinishGame = () => {
    setIsDone(true);
    // Limpiar por completo
    const canvas = canvasRef.current;
    ctx.current.clearRect(0, 0, canvas.width, canvas.height);

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
        position: 'relative', overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: 20, width: '100%', textAlign: 'center',
        zIndex: 10, color: '#334155', fontWeight: 'bold', fontSize: '1.2rem',
        textShadow: '0 2px 4px rgba(255,255,255,0.8)'
      }}>
        Limpia la pantalla para descubrir el secreto
      </div>

      {/* Imagen de fondo */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1
      }} />

      {/* Capa de raspado */}
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 2, cursor: 'pointer'
        }}
      />

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out', zIndex: 200
        }}>
          <h2 style={{color: '#334155', margin: 0, fontSize: '2.5rem'}}>¡Descubierto!</h2>
          <p style={{color: '#64748b', fontSize: '1.2rem', marginTop: '0.5rem'}}>Limpiaste todo muy bien.</p>
        </div>
      )}
    </div>
  );
}
