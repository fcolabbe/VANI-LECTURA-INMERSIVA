import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { vaniData } from '../data/vaniData';
import { useJourney } from '../context/JourneyContext';
import { useResponsive } from '../hooks/useResponsive';
import VaniGuide from '../components/VaniGuide';

export default function Personaje() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { journeyDay } = useJourney();
  const { isTabletLandscape } = useResponsive();
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const p = vaniData.personajes[id];

  // Play profile description audio on load
  useEffect(() => {
    if (!p) return;
    const audioUrl = `/audio/descripcion_${id}.mp3`;
    const audio = new Audio(audioUrl);
    
    const textToSpeak = `${p.quienEs} ${p.caracteristicas} ${p.queHace}`;
    let synthUtterance = null;
    const synth = window.speechSynthesis;
    
    const playAudio = () => {
      audio.play()
        .then(() => {
          setIsSpeaking(true);
          audio.addEventListener('ended', () => setIsSpeaking(false));
        })
        .catch(err => {
          console.warn("No se pudo reproducir el audio pregrabado, usando síntesis nativa:", err.message);
          if (synth) {
            synth.cancel();
            synthUtterance = new SpeechSynthesisUtterance(textToSpeak);
            synthUtterance.lang = 'es-ES';
            synthUtterance.rate = 0.85;
            synthUtterance.pitch = 1.1;
            synthUtterance.onstart = () => setIsSpeaking(true);
            synthUtterance.onend = () => setIsSpeaking(false);
            synth.speak(synthUtterance);
          }
        });
    };

    // Small delay to let page transition animation play smoothly
    const timer = setTimeout(playAudio, 500);

    return () => {
      clearTimeout(timer);
      audio.pause();
      if (synth) {
        synth.cancel();
      }
    };
  }, [id, p]);

  if (!p) return <div>Personaje no encontrado</div>;
  if (journeyDay < p.diaSuscripcionRequerido) return <Navigate to="/" />;

  // Find dynamic ecoesfera of this character to go back to the correct bioma map
  const ecoesferaId = Object.values(vaniData.ecoesferas).find(e => e.personajesIds.includes(id))?.id || '';

  // Retrieve dynamic Chapter 0 title from vaniData
  const capData = vaniData.capitulos[`${id}_0`];
  const capTitulo = capData ? capData.titulo.replace('Episodio 0: ', '') : 'El Despertar';

  // Obtener todos los capítulos disponibles en la data para este personaje
  const progresoSimulado = Object.keys(vaniData.capitulos)
    .filter(key => key.startsWith(`${id}_`))
    .map(key => {
      const capNum = parseInt(key.split('_')[1], 10);
      const data = vaniData.capitulos[key];
      return {
        capitulo: capNum,
        titulo: data.titulo.replace(new RegExp(`Episodio ${capNum}: `, 'i'), ''),
        estado: 'disponible' // Todos disponibles para pruebas de producción
      };
    })
    .sort((a, b) => a.capitulo - b.capitulo);

  const juegosSimulados = [
    { id: 'j1', nombre: 'Juego de Trazo', icono: '✏️', bloqueado: false },
    { id: 'j2', nombre: 'Rompecabezas', icono: '🧩', bloqueado: true },
    { id: 'j3', nombre: `Pinta a ${p.nombre}`, icono: '🎨', bloqueado: true }
  ];

  const renderTarjetaCapitulo = (item, index) => {
    const capKey = `${id}_${item.capitulo}`;
    const capDataLocal = vaniData.capitulos[capKey];
    const bgImg = (capDataLocal && capDataLocal.escenas && capDataLocal.escenas[0]) 
                    ? capDataLocal.escenas[0].imagenEstatica 
                    : p.imagenCard;

    return (
      <div 
        key={index}
        onClick={() => {
          if (item.estado === 'disponible' || item.estado === 'completado') navigate(`/capitulo/${id}/${item.capitulo}`);
        }}
        style={{
          width: '260px', height: '340px', flexShrink: 0, scrollSnapAlign: 'center',
          borderRadius: '24px', position: 'relative', overflow: 'hidden',
          cursor: item.estado !== 'bloqueado' ? 'pointer' : 'default',
          boxShadow: item.estado !== 'bloqueado' ? '0 10px 30px rgba(0,0,0,0.08)' : 'none',
          opacity: item.estado === 'bloqueado' ? 0.8 : 1,
          filter: item.estado === 'bloqueado' ? 'grayscale(0.8)' : 'none',
          border: item.estado === 'bloqueado' ? '2px dashed rgba(100,100,100,0.3)' : '2px solid rgba(255,255,255,0.8)',
          backgroundColor: '#f1f5f9'
        }}
      >
        <img src={bgImg} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
        
        {/* Overlay gradiente oscuro abajo */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 60%)' }}></div>
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '1.5rem', color: 'white' }}>
          <p style={{ margin: '0 0 0.2rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            CAPÍTULO {item.capitulo}
          </p>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {item.titulo}
          </h3>
          
          {item.estado === 'bloqueado' && (
            <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔒 {item.mensaje}
            </p>
          )}
          {(item.estado === 'disponible' || item.estado === 'completado') && (
            <div style={{ 
              display: 'inline-flex', padding: '6px 12px', borderRadius: '20px', 
              background: item.estado === 'completado' ? '#22c55e' : '#f59e0b',
              fontSize: '0.8rem', fontWeight: 'bold', alignItems: 'center', gap: '6px'
            }}>
              {item.estado === 'completado' ? '⭐ Completado' : '▶️ Empezar'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      height: '100dvh', width: '100vw', overflow: 'hidden', 
      display: 'flex', flexDirection: 'column', backgroundColor: '#f7f3eb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>{`
        /* Ocultar scrollbar en el carrusel */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* VaniGuide Flotante */}
      <VaniGuide 
        state={isSpeaking ? 'animar' : 'idle'} 
        floating={true} 
      />

      {/* ZONA PRINCIPAL DE CONTENIDO */}
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: isTabletLandscape ? 'row' : 'column', overflow: 'hidden'
      }}>
        {isTabletLandscape ? (
          // === LAYOUT TABLET HORIZONTAL (PANTALLA DIVIDIDA) ===
          <>
            {/* Panel Izquierdo: Info del Personaje */}
            <div className="hide-scrollbar" style={{ 
              width: '40%', height: '100%', padding: '2rem',
              display: 'flex', flexDirection: 'column', overflowY: 'auto',
              backgroundColor: 'white', borderRight: '1px solid #e2e8f0',
              boxShadow: '2px 0 15px rgba(0,0,0,0.03)', zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                  onClick={() => navigate(`/ecoesfera/${ecoesferaId}`)}
                  style={{
                    width: '50px', height: '50px', borderRadius: '50%', background: '#f1f5f9', border: 'none',
                    color: '#64748b', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ←
                </button>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: p.imgBg, flexShrink: 0 }}></div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '2rem', color: '#334155' }}>{p.nombre}</h1>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#64748b' }}>{p.titulo}</p>
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: 0, fontSize: '1.15rem', lineHeight: '1.7', color: '#334155', textAlign: 'center' }}>
                  {p.quienEs} {p.caracteristicas} {p.queHace}
                </p>
              </div>
            </div>

            {/* Panel Derecho: Grilla de Capítulos */}
            <div className="hide-scrollbar" style={{ 
              width: '60%', height: '100%', padding: '3rem 2rem',
              overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '2rem',
              justifyContent: 'center', alignContent: 'flex-start'
            }}>
              {progresoSimulado.map((item, index) => renderTarjetaCapitulo(item, index))}
            </div>
          </>
        ) : (
          // === LAYOUT MOVIL VERTICAL ===
          <>
            {/* Top Box: Textos fijos con scroll interno */}
            <div className="hide-scrollbar" style={{ 
              flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' 
            }}>
              {/* 1. Cabecera Fija */}
              <div style={{ 
                padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', 
                backgroundColor: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.03)', zIndex: 10,
                flexShrink: 0, position: 'sticky', top: 0
              }}>
                <button 
                  onClick={() => navigate(`/ecoesfera/${ecoesferaId}`)}
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', border: 'none',
                    color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ←
                </button>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: p.imgBg, flexShrink: 0 }}></div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#334155' }}>{p.nombre}</h1>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>{p.titulo}</p>
                </div>
              </div>

              {/* 2. Bloque de Texto Descriptivo */}
              <div style={{ padding: '1.5rem 2rem', flexShrink: 0 }}>
                <p style={{ 
                  margin: 0, fontSize: '1.1rem', lineHeight: '1.7', color: '#334155', 
                  backgroundColor: 'rgba(255,255,255,0.75)', padding: '1.2rem 1.5rem', borderRadius: '20px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', textAlign: 'center'
                }}>
                  {p.quienEs} {p.caracteristicas} {p.queHace}
                </p>
              </div>
            </div>

            {/* 3. Carrusel Horizontal de Capítulos */}
            <div className="hide-scrollbar" style={{ 
              flexShrink: 0, padding: '0 2rem 1.5rem 2rem', 
              display: 'flex', overflowX: 'auto', gap: '1.5rem', scrollSnapType: 'x mandatory',
              alignItems: 'center'
            }}>
              {progresoSimulado.map((item, index) => renderTarjetaCapitulo(item, index))}
              {/* Espacio final invisible para centrado */}
              <div style={{ width: '1px', flexShrink: 0 }}></div>
            </div>
          </>
        )}
      </div>

      {/* 4. Barra Inferior Fija de Actividades/Juegos (Siempre Abajo, en ambos layouts) */}
      <div style={{ 
        height: '90px', flexShrink: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 1rem',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.03)', zIndex: 20
      }}>
        {juegosSimulados.map(juego => (
          <div key={juego.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: juego.bloqueado ? 0.5 : 1 }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '16px', backgroundColor: '#f1f5f9', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '4px',
              position: 'relative'
            }}>
              {juego.icono}
              {juego.bloqueado && (
                <div style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>🔒</div>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{juego.nombre}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
