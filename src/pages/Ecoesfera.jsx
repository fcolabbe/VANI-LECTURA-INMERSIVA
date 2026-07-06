import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vaniData } from '../data/vaniData';
import { useJourney } from '../context/JourneyContext';
import { useResponsive } from '../hooks/useResponsive';
import VaniGuide from '../components/VaniGuide';
import BackButton from '../components/BackButton';
import { useNarracionScroll } from '../hooks/useNarracionScroll';

export default function Ecoesfera() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { journeyDay } = useJourney();
  const { isTabletLandscape, isShortLandscape } = useResponsive();
  const eco = vaniData.ecoesferas[id];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  // El texto del bioma scrollea sincronizado con la narración
  const textoNarrado = eco ? `${eco.textoEcoesfera} ${eco.rolPersonajes}` : '';
  const textoScrollRef = useNarracionScroll({ isSpeaking, audioRef, text: textoNarrado });

  // Play biome description audio on load
  useEffect(() => {
    if (!eco) return;
    const audioUrl = `/audio/bioma_${id}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const cleanText = `${eco.textoEcoesfera.replace(/"/g, '')} ${eco.rolPersonajes}`;
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
            synthUtterance = new SpeechSynthesisUtterance(cleanText);
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
      audioRef.current = null;
      if (synth) {
        synth.cancel();
      }
    };
  }, [id, eco]);

  if (!eco) return <div>Ecoesfera no encontrada</div>;

  const personajes = eco.personajesIds.map(pid => vaniData.personajes[pid]);

  const renderTarjetaPersonaje = (p) => {
    const isUnlocked = journeyDay >= p.diaSuscripcionRequerido;
    const statusText = isUnlocked ? 'Desbloqueado' : `Vuelve en el Día ${p.diaSuscripcionRequerido}`;

    return (
      <div 
        key={p.id}
        onClick={() => isUnlocked && navigate(`/personaje/${p.id}`)}
        style={{
          width: '280px', flexShrink: 0, scrollSnapAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '24px', cursor: isUnlocked ? 'pointer' : 'not-allowed', overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          opacity: isUnlocked ? 1 : 0.7,
          filter: isUnlocked ? 'none' : 'grayscale(0.8)',
          border: '1px solid rgba(255,255,255,0.5)'
        }}
      >
        <div style={{ width: '100%', height: '320px', overflow: 'hidden', backgroundColor: p.imgBg, position: 'relative' }}>
            <img 
              src={p.imagenCard} 
              alt={p.nombre} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!isUnlocked && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '3rem' }}>
                🔒
              </div>
            )}
        </div>
        <div style={{ padding: '1.2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#334155', margin: '0 0 0.4rem 0' }}>{p.nombre}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{p.titulo}</p>
          
          <div style={{ 
            background: isUnlocked ? '#dcfce7' : '#f1f5f9', 
            color: isUnlocked ? '#166534' : '#64748b',
            padding: '8px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', display: 'inline-block' 
          }}>
            {statusText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ 
      display: 'flex', flexDirection: isTabletLandscape ? 'row' : 'column',
      height: '100dvh', width: '100vw', overflow: 'hidden',
      background: eco.fondoImage.includes('.png') ? `url(${eco.fondoImage}) center/cover no-repeat` : eco.fondoImage,
      position: 'relative'
    }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Botón Volver */}
      <BackButton onClick={() => navigate('/')} style={{ color: '#5a6b67', zIndex: 10 }} />

      {/* VaniGuide Flotante */}
      <VaniGuide 
        state={isSpeaking ? 'animar' : 'idle'} 
        floating={true} 
      />

      {isTabletLandscape ? (
        // === LAYOUT TABLET HORIZONTAL (PANTALLA DIVIDIDA) ===
        <>
          {/* Panel Izquierdo: Info de Bioma (compacto si es un teléfono en horizontal) */}
          <div ref={textoScrollRef} className="hide-scrollbar" style={{
            width: '40%', height: '100%',
            padding: isShortLandscape ? 'calc(1.25rem + env(safe-area-inset-top)) 1.5rem 1.5rem 1.5rem' : '6rem 2rem 2rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(255,255,255,0.4)', overflowY: 'auto'
          }}>
            <h1 style={{
              fontSize: isShortLandscape ? 'clamp(1.3rem, 3.5vw, 1.8rem)' : '3rem', color: '#4a5b57',
              marginBottom: isShortLandscape ? '1rem' : '2rem',
              paddingLeft: isShortLandscape ? '76px' : 0,
              textAlign: 'center', textShadow: '0 2px 10px rgba(255,255,255,0.7)'
            }}>
              {eco.nombre}
            </h1>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '24px', padding: isShortLandscape ? '1.25rem' : '2rem', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.6)'
            }}>
              <p style={{ fontSize: isShortLandscape ? '1rem' : '1.2rem', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
                {eco.textoEcoesfera}
              </p>
              <p style={{ fontSize: isShortLandscape ? '0.95rem' : '1.1rem', lineHeight: '1.6', fontWeight: '500', margin: 0, color: '#334155' }}>
                {eco.rolPersonajes}
              </p>
            </div>
          </div>

          {/* Panel Derecho: Grilla de Personajes */}
          <div className="hide-scrollbar" style={{
            width: '60%', height: '100%', padding: isShortLandscape ? '1.25rem 1.5rem' : '4rem 2rem',
            overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '2rem',
            justifyContent: 'center', alignContent: 'flex-start'
          }}>
            {personajes.map(p => renderTarjetaPersonaje(p))}
          </div>
        </>
      ) : (
        // === LAYOUT MOVIL VERTICAL ===
        <>
          {/* Título Fijo Siempre Visible (padding lateral para no chocar con el botón volver) */}
          <div style={{ flexShrink: 0, paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingBottom: '10px', width: '100%', zIndex: 5 }}>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', color: '#4a5b57', margin: '0', padding: '0 96px',
              textAlign: 'center', textShadow: '0 2px 10px rgba(255,255,255,0.7)'
            }}>
              {eco.nombre}
            </h1>
          </div>

          {/* Box Textual Descriptivo con scroll interno y fade que indica "hay más texto" */}
          <div style={{
            flex: 1, minHeight: 0, padding: '1rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div ref={textoScrollRef} className="hide-scrollbar" style={{
              maxWidth: '800px', maxHeight: '100%', overflowY: 'auto',
              backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '24px', padding: '1.5rem 2rem 2.25rem 2rem', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)', color: '#475569',
              border: '1px solid rgba(255,255,255,0.4)', marginTop: 'auto', marginBottom: 'auto'
            }}>
              <p style={{ fontSize: 'clamp(0.95rem, 2.6vw, 1.1rem)', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                {eco.textoEcoesfera}
              </p>
              <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', lineHeight: '1.6', fontWeight: '500', margin: 0, color: '#334155' }}>
                {eco.rolPersonajes}
              </p>
              <div aria-hidden="true" style={{
                position: 'sticky', bottom: '-2.25rem', left: 0, right: 0, height: '38px', marginTop: '-38px',
                marginLeft: '-2rem', marginRight: '-2rem', marginBottom: '-2.25rem',
                background: 'linear-gradient(to top, rgba(255,255,255,0.92), rgba(255,255,255,0))',
                borderRadius: '0 0 24px 24px', pointerEvents: 'none'
              }} />
            </div>
          </div>

          {/* Carrusel Horizontal de Personajes */}
          <div className="hide-scrollbar" style={{ 
            flexShrink: 0, 
            padding: '1rem 2rem 3rem 2rem',
            display: 'flex', 
            overflowX: 'auto', 
            scrollSnapType: 'x mandatory',
            gap: '2rem',
            alignItems: 'center'
          }}>
            {personajes.map(p => renderTarjetaPersonaje(p))}
            <div style={{ width: '1px', flexShrink: 0 }}></div>
          </div>
        </>
      )}
    </div>
  );
}

