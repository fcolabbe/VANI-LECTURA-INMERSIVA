import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vaniData } from '../data/vaniData';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function TestLectura() {
  const { personajeId, capituloId } = useParams();
  const navigate = useNavigate();
  
  // Buscar el texto completo del capítulo uniendo las escenas
  const capitulo = vaniData.capitulos[`${personajeId}_${capituloId}`];
  const [textoCompleto, setTextoCompleto] = useState('');
  const [palabrasTotales, setPalabrasTotales] = useState(0);

  useEffect(() => {
    if (capitulo) {
      const cleanTexto = capitulo.escenas.map(e => {
        return e.texto.replace(/\[(.*?)\]\(magic-word:(.*?)\)/g, '$1');
      }).join(' ');
      setTextoCompleto(cleanTexto);
      setPalabrasTotales(cleanTexto.split(/\s+/).filter(Boolean).length);
    }
  }, [capitulo]);

  // Estados del Test
  const [fase, setFase] = useState('preparacion'); // preparacion | cuenta_regresiva | leyendo | resultados
  const [cuenta, setCuenta] = useState(3);
  
  // Métricas
  const startTimeRef = useRef(null);
  const [tiempoS, setTiempoS] = useState(0);
  const [wpm, setWpm] = useState(0);

  const iniciarCuentaRegresiva = () => {
    setFase('cuenta_regresiva');
    let c = 3;
    setCuenta(c);
    const interval = setInterval(() => {
      c--;
      if (c > 0) {
        setCuenta(c);
      } else {
        clearInterval(interval);
        setFase('leyendo');
        startTimeRef.current = Date.now();
      }
    }, 1000);
  };

  const { activeProfile } = useAuth(); // NEW: Obtener perfil activo

  const terminarLectura = async () => {
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTimeRef.current) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    const calculoWpm = Math.round(palabrasTotales / elapsedMinutes);
    
    setTiempoS(Math.round(elapsedSeconds));
    setWpm(calculoWpm);
    setFase('resultados');

    // Generar un diagnóstico clínico simple basado en WPM
    let diagText = "";
    if (calculoWpm < 30) {
      diagText = "Lectura silábica. Requiere refuerzo en decodificación básica y reconocimiento de palabras frecuentes.";
    } else if (calculoWpm < 60) {
      diagText = "Lectura vacilante. Buen progreso, se recomienda practicar lectura en voz alta diaria para mejorar la fluidez.";
    } else {
      diagText = "Lectura fluida. Excelente ritmo y reconocimiento visual de palabras. Listo para textos más complejos.";
    }

    const reporte = {
      usuario_id: "jugador_sesion_actual", // legacy
      perfilId: activeProfile?.id || "huesped", // NEW: ID del niño
      fecha: new Date().toISOString(),
      personaje_id: personajeId,
      capitulo_id: capituloId,
      wpm: calculoWpm,
      tiempo_total_s: elapsedSeconds,
      palabras_totales: palabrasTotales,
      diagnostico: diagText
    };

    console.log(`[Telemetría Clínica] Personaje: ${personajeId}, WPM: ${calculoWpm}, Tiempo: ${elapsedSeconds}s`);
    
    if (db) {
      try {
        await addDoc(collection(db, "diagnosticos_padres"), reporte);
        console.log("Telemetría de test guardada en Firestore (diagnosticos_padres).");
      } catch (e) {
        console.error("Error guardando telemetría de test", e);
      }
    }
  };

  if (!capitulo) return <div>Capítulo no encontrado</div>;

  return (
    <div style={{
      height: '100dvh', width: '100vw', 
      backgroundColor: '#fbfaf7', // Fondo neutro crema/sepia clínico
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Botón Volver - Área Táctil 64x64 */}
      <button 
        onClick={() => navigate(`/capitulo/${personajeId}/${capituloId}`)}
        style={{
          position: 'absolute', top: '20px', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)', color: '#4a4a4a', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>
      
      {/* Cabecera Fija */}
      <h1 style={{ color: '#2a241c', fontSize: '2.5rem', marginBottom: '1.5rem', flexShrink: 0, textAlign: 'center', fontWeight: 'bold', marginTop: '40px' }}>
        Reto de Velocidad Lectora
      </h1>

      <div className="hide-scrollbar" style={{ flex: 1, width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {fase === 'preparacion' && (
          <div style={{ textAlign: 'center', maxWidth: '500px', animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '1.3rem', marginBottom: '3rem', lineHeight: '1.6' }}>
              Lee el texto a tu propio ritmo. El tiempo no aparecerá en pantalla para que leas con tranquilidad.
            </p>
            <button 
              onClick={iniciarCuentaRegresiva}
              style={{
                padding: '1.2rem 3rem', borderRadius: '30px', background: '#0D9488', color: 'white', 
                border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: 'none',
                minHeight: '64px', minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              Dime cuando estés listo
            </button>
          </div>
        )}

        {fase === 'cuenta_regresiva' && (
          <div style={{ fontSize: '8rem', fontWeight: 'bold', color: '#0D9488', animation: 'pulse 1s infinite' }}>
            {cuenta}
          </div>
        )}

        {fase === 'leyendo' && (
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              backgroundColor: 'white', padding: '3rem', borderRadius: '24px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '3rem', width: '100%'
            }}>
              <p style={{ 
                fontSize: '1.8rem', lineHeight: '2', color: '#2a241c', // Mayor contraste
                margin: 0, textAlign: 'left', fontWeight: '500' 
              }}>
                {textoCompleto}
              </p>
            </div>

            <button 
              onClick={terminarLectura}
              style={{
                padding: '1rem 4rem', borderRadius: '30px', background: '#0D9488', color: 'white', 
                border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: 'none',
                minHeight: '64px', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ¡Terminé!
            </button>
          </div>
        )}

        {fase === 'resultados' && (
          <div style={{ textAlign: 'center', maxWidth: '500px', animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ color: '#2a241c', fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>¡Excelente trabajo!</h1>
            
            <div style={{ 
              backgroundColor: 'white', padding: '2rem', borderRadius: '20px', 
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '2rem', width: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>PALABRAS POR MINUTO</p>
                  <p style={{ color: '#0D9488', fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{wpm}</p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>TIEMPO TOTAL</p>
                  <p style={{ color: '#78350F', fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{tiempoS}s</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '1rem 3rem', borderRadius: '30px', background: '#f1f5f9', color: '#4a4a4a', 
                border: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                minHeight: '64px', minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
              }}
            >
              Volver al Mapa
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.5; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
