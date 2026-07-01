import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Coloreado Mágico
export default function ColorEngine({ 
  nivel = 1, 
  imageSrc = '/personaje_cuento0.png',
  onComplete 
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isDone, setIsDone] = useState(false);
  const [percentCleared, setPercentCleared] = useState(0);

  // Dificultad
  const getBrushSize = () => {
    if (nivel === 1) return 150; // Gran explosión de color
    if (nivel === 2) return 100;
    return 60; // Más detalle requerido
  };
  
  const getTargetPercent = () => {
    if (nivel === 1) return 0.5;
    if (nivel === 2) return 0.7;
    return 0.85;
  };

  const metrics = useRef({
    startTime: 0,
    missClicks: 0 
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
    
    // Draw the grayscale image on the canvas
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Dibujar imagen original
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Aplicar filtro de grises manipulando los pixeles
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
      }
      context.putImageData(imageData, 0, 0);

      // Ahora que está en grises, cambiamos el composite a destination-out para que al dibujar, se borre el gris y muestre el color debajo
      context.globalCompositeOperation = 'destination-out';
      context.lineJoin = 'round';
      context.lineCap = 'round';
      
      // Creamos un efecto de brocha difuminada
      const brushSize = getBrushSize();
      context.lineWidth = brushSize;
      
      // Hacemos que los bordes del borrado sean suaves usando shadow
      context.shadowBlur = brushSize / 2;
      context.shadowColor = 'black';
    };

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
    if (isDone || !ctx.current) return;
    isDrawing.current = true;
    const { x, y } = getPointerPos(e);
    ctx.current.beginPath();
    ctx.current.moveTo(x, y);
    ctx.current.lineTo(x + 0.1, y + 0.1);
    ctx.current.stroke();
  };

  const draw = (e) => {
    if (!isDrawing.current || isDone || !ctx.current) return;
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
    if (isDone || !ctx.current) return;
    
    const canvas = canvasRef.current;
    const context = ctx.current;
    const stride = 15;
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
        touchAction: 'none', backgroundColor: '#000'
      }}
    >
      <div style={{
        position: 'absolute', top: 20, width: '100%', textAlign: 'center',
        zIndex: 10, color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
      }}>
        Toca la pantalla para darle color al mundo
      </div>

      {/* Imagen de fondo a todo color */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        zIndex: 1
      }} />

      {/* Capa Canvas en Escala de Grises */}
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
          <h2 style={{color: '#db2777', margin: 0, fontSize: '2.5rem'}}>¡Mágico!</h2>
          <p style={{color: '#be185d', fontSize: '1.2rem', marginTop: '0.5rem'}}>El mundo volvió a tener color.</p>
        </div>
      )}
    </div>
  );
}
