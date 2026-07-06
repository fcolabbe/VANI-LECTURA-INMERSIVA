import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentalGate from '../components/ParentalGate';
import { vaniData } from '../data/vaniData';
import VaniGuide from '../components/VaniGuide';
import BottomNav from '../components/BottomNav';
import { useResponsive } from '../hooks/useResponsive';

export default function MundoVani() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isShortLandscape } = useResponsive();
  // Pantalla angosta o teléfono acostado: saludo corto + botón de audio
  const modoCompacto = isMobile || isShortLandscape;
  const nombreUsuario = location.state?.nombreJugador || 'Explorador';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const carouselRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);

  // Mapa de embajadores por bioma según decisión clínica
  const embajadores = {
    tierra: 'leo',
    agua: 'nia',
    aire: 'bibi'
  };

  const copyBienvenida = "¡Hola! Te doy la bienvenida a mi mundo. Me llamo Vani y seré tu guía en esta aventura. Mi luz te acompañará en cada paso que des. Aquí viven muchos amigos increíbles. Algunos son muy traviesos y aventureros; otros, criaturas tiernas y adorables. ¡Toca a mis amigos para descubrir todas las historias y juegos que hemos preparado para ti! ¿Empezamos?";
  // Versión corta para pantallas angostas: el saludo completo se escucha en audio
  const copyCorto = "¡Hola! Soy Vani, tu guía. Toca a mis amigos para descubrir sus historias. ¿Empezamos?";

  useEffect(() => {
    const audio = new Audio('/audio/bienvenida_vani.mp3');
    audioRef.current = audio;
    audio.volume = 0.85;
    audio.onplay = () => setIsSpeaking(true);
    audio.onpause = () => setIsSpeaking(false);
    audio.onended = () => setIsSpeaking(false);

    const timer = setTimeout(() => {
      audio.play().catch(err => {
        console.warn("Autoplay bloqued by browser:", err);
        setIsSpeaking(false);
      });
    }, 800);

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggleGreetingAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => setIsSpeaking(false));
    } else {
      audio.pause();
    }
  };

  // Detectar la tarjeta más centrada del carrusel para los indicadores
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = Array.from(el.children).filter(c => c.dataset && c.dataset.card);
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActiveCard(best);
  };

  const ecoesferas = Object.values(vaniData.ecoesferas);

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', backgroundColor: '#f7f3eb',
      overflow: 'hidden',
      paddingTop: 'calc(40px + env(safe-area-inset-top))',
      paddingBottom: 'calc(90px + env(safe-area-inset-bottom))'
    }}>
      <div style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', zIndex: 50 }}>
        <ParentalGate />
      </div>

      {/* Logo VANI en la esquina superior derecha */}
      <div style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', right: '20px', zIndex: 50 }}>
        <img
          src="/logo.png"
          alt="VANI Logo"
          style={{ width: modoCompacto ? "48px" : "60px", height: modoCompacto ? "48px" : "60px", objectFit: 'contain', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
        />
      </div>

      {/* Sección VANI Hero (Ancla Narrativa - FIJA) */}
      <div style={{ padding: modoCompacto ? '0 1.25rem' : '0 2rem', marginBottom: modoCompacto ? '1rem' : '2rem', display: 'flex', alignItems: 'center', gap: modoCompacto ? '12px' : '20px', marginTop: '20px', flexShrink: 0 }}>
        <div style={{
          width: modoCompacto ? '64px' : '90px', height: modoCompacto ? '64px' : '90px', borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(230, 168, 92, 0.4)',
          flexShrink: 0,
          border: '4px solid white',
          position: 'relative'
        }}>
          <img
            src="/vani_avatar.png"
            alt="Hada Vani"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
          {/* Destello de Vani superpuesto al avatar */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
            <VaniGuide state={isSpeaking ? 'animar' : 'idle'} overrideStyle={{ position: 'static', top: 'auto', right: 'auto' }} />
          </div>
        </div>

        {/* Speech Bubble */}
        <div style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          padding: modoCompacto ? '0.9rem 1.1rem' : '1.2rem 1.5rem',
          borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          border: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {/* Triangulito del bocadillo */}
          <div style={{
            position: 'absolute', top: '50%', left: '-10px', transform: 'translateY(-50%)',
            width: '0', height: '0', borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent', borderRight: '10px solid #ffffff'
          }}></div>

          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: modoCompacto ? '1.15rem' : '1.4rem', margin: '0 0 0.3rem 0', color: '#334155', fontWeight: '600' }}>
              ¡Hola, {nombreUsuario}!
            </h1>
            <p style={{ fontSize: modoCompacto ? '0.9rem' : '1rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
              {modoCompacto ? copyCorto : copyBienvenida}
            </p>
          </div>

          {/* En móvil el saludo completo se escucha con este botón */}
          {modoCompacto && (            <button
              onClick={toggleGreetingAudio}
              aria-label={isSpeaking ? 'Pausar saludo de Vani' : 'Escuchar saludo de Vani'}
              style={{
                flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%',
                background: isSpeaking ? '#fef3c7' : '#f1f5f9', border: 'none',
                fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSpeaking ? '0 0 12px #fde68a' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {isSpeaking ? '⏸️' : '🔊'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Área del carrusel: las tarjetas se adaptan a la altura disponible */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="hide-scrollbar"
          style={{
            display: 'flex', gap: '1.5rem', overflowX: 'auto',
            padding: modoCompacto ? '0 1.25rem' : '0 2rem',
            scrollSnapType: 'x mandatory', scrollBehavior: 'smooth',
            width: '100%', height: '100%', alignItems: 'center'
          }}
        >
          {ecoesferas.map(eco => {
            const embajadorId = embajadores[eco.id];
            const personaje = vaniData.personajes[embajadorId];

            return (
              <div
                key={eco.id}
                data-card="true"
                onClick={() => navigate(`/ecoesfera/${eco.id}`)}
                style={{
                  height: 'min(100%, 440px)', minHeight: '240px',
                  aspectRatio: '3 / 4', minWidth: 'min(280px, 74vw)',
                  borderRadius: '24px', backgroundColor: eco.bg,
                  cursor: 'pointer', scrollSnapAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  display: 'flex', flexDirection: 'column', flexShrink: 0,
                  overflow: 'hidden', position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                }}
              >
                {/* Imagen del Personaje Embajador de Fondo */}
                <img
                  src={personaje.imagenCard}
                  alt={`Embajador ${personaje.nombre}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Degradado inferior (Glassmorphism) para texto legible */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                  padding: '2rem 1.5rem 1.2rem 1.5rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                  <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#ffffff', margin: '0 0 0.3rem 0', fontWeight: '600' }}>
                    {eco.nombre}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0, fontWeight: '400' }}>
                    Explorar con {personaje.nombre}
                  </p>
                </div>
              </div>
            );
          })}
          {/* Respiro final para que la última tarjeta pueda centrarse */}
          <div style={{ width: '1px', flexShrink: 0 }}></div>
        </div>
      </div>

      {/* Indicadores del carrusel (solo móvil, donde no se ven todas las tarjetas) */}
      {modoCompacto && (        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px 0 4px 0' }}>
          {ecoesferas.map((eco, i) => (
            <div
              key={eco.id}
              style={{
                width: i === activeCard ? '22px' : '8px', height: '8px', borderRadius: '4px',
                backgroundColor: i === activeCard ? '#0D9488' : '#d6d3cb',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}

      {/* Menú Principal: Los 3 Pilares (Bottom Nav) */}
      <BottomNav />

    </div>
  );
}
