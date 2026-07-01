import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentalGate from '../components/ParentalGate';
import { vaniData } from '../data/vaniData';
import VaniGuide from '../components/VaniGuide';

export default function MundoVani() {
  const navigate = useNavigate();
  const location = useLocation();
  const nombreUsuario = location.state?.nombreJugador || 'Explorador';
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Mapa de embajadores por bioma según decisión clínica
  const embajadores = {
    tierra: 'leo',
    agua: 'nia',
    aire: 'bibi'
  };

  const copyBienvenida = "¡Hola! Te doy la bienvenida a mi mundo. Me llamo Vani y seré tu guía en esta aventura. Mi luz te acompañará en cada paso que des. Aquí viven muchos amigos increíbles. Algunos son muy traviesos y aventureros; otros, criaturas tiernas y adorables. ¡Toca a mis amigos para descubrir todas las historias y juegos que hemos preparado para ti! ¿Empezamos?";

  useEffect(() => {
    const audio = new Audio('/audio/bienvenida_vani.mp3');
    audio.volume = 0.85;

    const playGreeting = () => {
      setIsSpeaking(true);
      audio.play().catch(err => {
        console.warn("Autoplay bloqued by browser:", err);
        setIsSpeaking(false);
      });
    };

    audio.onended = () => {
      setIsSpeaking(false);
    };

    const timer = setTimeout(playGreeting, 800);

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.src = '';
    };
  }, []);

  return (
    <div className="fade-in" style={{ 
      display: 'flex', flexDirection: 'column',
      height: '100dvh', backgroundColor: '#f7f3eb',
      overflow: 'hidden', paddingTop: '40px', paddingBottom: '80px'
    }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 50 }}>
        <ParentalGate />
      </div>
      
      {/* Logo VANI en la esquina superior derecha */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }}>
        <img 
          src="/logo.png" 
          alt="VANI Logo" 
          style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
        />
      </div>
      
      {/* Sección VANI Hero (Ancla Narrativa - FIJA) */}
      <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', flexShrink: 0 }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
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
          padding: '1.2rem 1.5rem',
          borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          border: '1px solid #f1f5f9'
        }}>
          {/* Triangulito del bocadillo */}
          <div style={{
            position: 'absolute', top: '50%', left: '-10px', transform: 'translateY(-50%)',
            width: '0', height: '0', borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent', borderRight: '10px solid #ffffff'
          }}></div>
          
          <h1 style={{ fontSize: '1.4rem', margin: '0 0 0.4rem 0', color: '#334155', fontWeight: '600' }}>
            ¡Hola, {nombreUsuario}!
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
            {copyBienvenida}
          </p>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Área Scrolleable Vertical si fuera necesario, y horizontal para el carrusel */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center' }}>
        <div className="hide-scrollbar" style={{ 
          display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '0 2rem 2rem 2rem',
          scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', width: '100%'
        }}>
          {Object.values(vaniData.ecoesferas).map(eco => {
            const embajadorId = embajadores[eco.id];
            const personaje = vaniData.personajes[embajadorId];
            
            return (
              <div
                key={eco.id}
                onClick={() => navigate(`/ecoesfera/${eco.id}`)}
                style={{
                  minWidth: '280px', height: '373px', /* Ratio 3:4 portrait */
                  borderRadius: '24px', backgroundColor: eco.bg,
                  cursor: 'pointer', scrollSnapAlign: 'start', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  display: 'flex', flexDirection: 'column',
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
                  padding: '2rem 1.5rem 1.5rem 1.5rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', margin: '0 0 0.3rem 0', fontWeight: '600' }}>
                    {eco.nombre}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0, fontWeight: '400' }}>
                    Explorar con {personaje.nombre}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menú Principal: Los 3 Pilares (Bottom Nav) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '80px',
        backgroundColor: 'white', borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {/* Pilar 1: Historias (Activo) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#0D9488', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>📖</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Historias</span>
        </div>
        
        {/* Pilar 2: Retos WPM */}
        <div onClick={() => navigate('/hub-lectura')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', cursor: 'pointer', opacity: 0.8 }}>
          <span style={{ fontSize: '1.8rem', marginBottom: '4px', filter: 'grayscale(1)' }}>⏱️</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Retos WPM</span>
        </div>

        {/* Pilar 3: Actividades */}
        <div onClick={() => navigate('/hub-actividades')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', cursor: 'pointer', opacity: 0.8 }}>
          <span style={{ fontSize: '1.8rem', marginBottom: '4px', filter: 'grayscale(1)' }}>🎮</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Actividades</span>
        </div>
      </div>

    </div>
  );
}
