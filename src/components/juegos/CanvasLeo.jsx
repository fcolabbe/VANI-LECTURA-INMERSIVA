import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasLeo({ onComplete, onBack }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState(1);
  const [sessionStart] = useState(Date.now());
  const [missClicks, setMissClicks] = useState(0);

  // --- TELEMETRÍA GLOBAL ---
  const telemetriaRef = useRef({
    fase1_desviacion_promedio: 0,
    fase1_tiempo_arrastre_ms: 0,
    fase2_latencia_ms: 0,
    fase2_falsos_positivos: 0,
    fase3_tiempo_resolucion_ms: 0,
    fase3_errores_clasificacion: 0
  });

  const handleBackgroundClick = () => {
    setMissClicks(prev => prev + 1);
  };

  const finalizarJuego = () => {
    console.log("Actividades de Leo finalizadas.");
    if (onComplete) {
      onComplete();
    } else {
      navigate('/ecoesfera/tierra');
    }
  };

  // --- FASE 1: EL CAMINO DE LEO ---
  const Fase1 = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [progress, setProgress] = useState(0);
    const startX = useRef(0);
    const lastX = useRef(0);
    const devSum = useRef(0);
    const devCount = useRef(0);
    const dragStartTime = useRef(0);

    const startDrag = (e) => {
      e.stopPropagation();
      setIsDrawing(true);
      startX.current = e.clientX || e.touches[0].clientX;
      lastX.current = startX.current;
      dragStartTime.current = Date.now();
    };

    const moveDrag = (e) => {
      if (!isDrawing) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      // Calculate deviation from center Y (window.innerHeight / 2)
      const centerY = window.innerHeight / 2;
      const dev = Math.abs(clientY - centerY);
      devSum.current += dev;
      devCount.current += 1;

      const p = Math.max(0, Math.min(100, ((clientX - startX.current) / (window.innerWidth * 0.6)) * 100));
      setProgress(p);

      if (p >= 95) {
        setIsDrawing(false);
        telemetriaRef.current.fase1_desviacion_promedio = devCount.current > 0 ? (devSum.current / devCount.current).toFixed(2) : 0;
        telemetriaRef.current.fase1_tiempo_arrastre_ms = Date.now() - dragStartTime.current;
        setTimeout(() => setFase(2), 1000);
      }
    };

    const stopDrag = () => {
      if (isDrawing && progress < 95) {
        // Reset if let go too early
        setProgress(0);
        setIsDrawing(false);
      }
    };

    return (
      <div 
        onPointerMove={moveDrag} 
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
        style={{
          width: '100%', height: '100%', 
          backgroundImage: 'url(/leo_fase1_sendero.png)', 
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: '#fef3c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <div style={{
          width: '60%', height: '40px', backgroundColor: 'rgba(255,255,255,0.4)',
          borderRadius: '20px', position: 'relative', border: '2px dashed rgba(255,255,255,0.8)',
          backdropFilter: 'blur(5px)'
        }}>
          <div 
            onPointerDown={startDrag}
            style={{
              position: 'absolute', top: '-12px', left: `calc(${progress}% - 32px)`,
              width: '64px', height: '64px', backgroundColor: '#fde047',
              borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'none', fontSize: '1.5rem'
            }}
          >
            👆
          </div>
        </div>
      </div>
    );
  };

  // --- FASE 2: PIEDRAS QUIETAS ---
  const Fase2 = () => {
    const [stoneVisible, setStoneVisible] = useState(false);
    const [isStopSignal, setIsStopSignal] = useState(false);
    const [message, setMessage] = useState("Espera...");
    const appearTime = useRef(0);
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
      runTrial();
    }, [attempts]);

    const runTrial = () => {
      setStoneVisible(false);
      setMessage("Espera...");
      const delay = 2000 + Math.random() * 2000;
      
      setTimeout(() => {
        const isStop = Math.random() > 0.6; // 40% chance of stop signal
        setIsStopSignal(isStop);
        setStoneVisible(true);
        appearTime.current = Date.now();
        setMessage(isStop ? "¡NO TOQUES!" : "¡TOCA!");
        
        if (isStop) {
          // Si es stop, esperar 2 segundos. Si no tocó, gana el trial.
          setTimeout(() => {
            if (stoneVisible) {
              avanzarOReintentar(true);
            }
          }, 2000);
        }
      }, delay);
    };

    const avanzarOReintentar = (exito) => {
      setStoneVisible(false);
      if (exito) {
        if (attempts >= 2) {
          setFase(3);
        } else {
          setAttempts(a => a + 1);
        }
      } else {
        telemetriaRef.current.fase2_falsos_positivos += 1;
        setAttempts(a => a + 1);
      }
    };

    const handleStoneClick = (e) => {
      e.stopPropagation();
      if (!stoneVisible) return;
      
      const rt = Date.now() - appearTime.current;
      
      if (isStopSignal) {
        // Falló la inhibición
        setMessage("¡Oops! Era roja.");
        avanzarOReintentar(false);
      } else {
        // Acierto
        telemetriaRef.current.fase2_latencia_ms = rt;
        setMessage("¡Bien!");
        avanzarOReintentar(true);
      }
    };

    return (
      <div style={{
        width: '100%', height: '100%', 
        backgroundImage: 'url(/leo_fase2_piedras.png)', 
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#fef3c7',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 3rem',
          borderRadius: '20px',
          marginBottom: '50px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{color: '#334155', margin: 0, fontSize: '2.5rem'}}>{message}</h1>
        </div>
        {stoneVisible && (
          <div 
            onClick={handleStoneClick}
            style={{
              width: '120px', height: '120px', 
              backgroundColor: isStopSignal ? '#fca5a5' : '#fde047',
              borderRadius: '60px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: '4px solid white'
            }}
          />
        )}
      </div>
    );
  };

  // --- FASE 3: NIDOS ORDENADOS ---
  const Fase3 = () => {
    const [placed, setPlaced] = useState({ circle: false, square: false, triangle: false });
    const startTime = useRef(Date.now());

    const handleDrop = (shape) => {
      setPlaced(prev => ({ ...prev, [shape]: true }));
    };

    useEffect(() => {
      if (placed.circle && placed.square && placed.triangle) {
        telemetriaRef.current.fase3_tiempo_resolucion_ms = Date.now() - startTime.current;
        setTimeout(() => finalizarJuego(), 1500);
      }
    }, [placed]);

    return (
      <div style={{
        width: '100%', height: '100%', 
        backgroundImage: 'url(/leo_fase3_nidos.png)', 
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#fef3c7',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{color: '#334155', margin: 0}}>Ordena las formas</h2>
        </div>
        <div style={{display:'flex', gap:'40px', marginTop:'40px'}}>
          {!placed.circle && <div onClick={(e) => {e.stopPropagation(); handleDrop('circle')}} style={{width:'80px', height:'80px', backgroundColor:'#fca5a5', borderRadius:'50%', cursor:'pointer', border:'3px solid white', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}} />}
          {!placed.square && <div onClick={(e) => {e.stopPropagation(); handleDrop('square')}} style={{width:'80px', height:'80px', backgroundColor:'#93c5fd', borderRadius:'16px', cursor:'pointer', border:'3px solid white', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}} />}
          {!placed.triangle && <div onClick={(e) => {e.stopPropagation(); handleDrop('triangle')}} style={{width:'0', height:'0', borderLeft:'40px solid transparent', borderRight:'40px solid transparent', borderBottom:'80px solid #86efac', cursor:'pointer', filter:'drop-shadow(0 4px 10px rgba(0,0,0,0.1))'}} />}
        </div>
        <div style={{display:'flex', gap:'40px', marginTop:'100px', opacity: 0.8}}>
          <div style={{width:'100px', height:'100px', border:'4px dashed #64748b', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontWeight:'bold', background:'rgba(255,255,255,0.3)', backdropFilter:'blur(5px)'}}>1</div>
          <div style={{width:'100px', height:'100px', border:'4px dashed #64748b', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontWeight:'bold', background:'rgba(255,255,255,0.3)', backdropFilter:'blur(5px)'}}>2</div>
          <div style={{width:'100px', height:'100px', border:'4px dashed #64748b', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:'10px', color:'#64748b', fontWeight:'bold', background:'rgba(255,255,255,0.3)', backdropFilter:'blur(5px)'}}>3</div>
        </div>
        {placed.circle && placed.square && placed.triangle && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
            padding: '3rem 5rem', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            textAlign: 'center', animation: 'fadeIn 0.5s ease'
          }}>
            <h1 style={{color:'#d97706', fontSize:'3rem', margin: 0}}>¡Bien hecho!</h1>
            <p style={{color: '#64748b', fontSize: '1.2rem', marginTop: '1rem'}}>Nivel Completado</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div onClick={handleBackgroundClick} style={{width: '100%', height: '100dvh', overflow: 'hidden', backgroundColor: '#fef3c7', fontFamily: 'system-ui, sans-serif', position: 'relative'}}>
      {/* Botón Volver */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (onBack) onBack();
          else navigate('/personaje/leo');
        }}
        style={{
          position: 'absolute', top: '20px', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 1010,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {fase === 1 && <Fase1 />}
      {fase === 2 && <Fase2 />}
      {fase === 3 && <Fase3 />}
    </div>
  );
}
