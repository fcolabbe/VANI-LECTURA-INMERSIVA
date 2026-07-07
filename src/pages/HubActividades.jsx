import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import { useActivities } from '../hooks/useActivities';
import { MASTER_LIBRARY, ENGINE_TYPES } from '../data/actividadesData';
import { construirRegistroActividad, NOMBRES_HABILIDAD } from '../utils/metricasClinicas';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

import LaberintoJuego from '../components/juegos/LaberintoJuego';
import BusquedaVisualJuego from '../components/juegos/BusquedaVisualJuego';
import RompecabezasEngine from '../components/juegos/RompecabezasEngine';
import DiferenciasEngine from '../components/juegos/DiferenciasEngine';
import SecuenciasEngine from '../components/juegos/SecuenciasEngine';
import SombrasEngine from '../components/juegos/SombrasEngine';
import MemoryEngine from '../components/juegos/MemoryEngine';
import RevealEngine from '../components/juegos/RevealEngine';
import ColorEngine from '../components/juegos/ColorEngine';
import TrazoEngine from '../components/juegos/TrazoEngine';
import ArrastreEngine from '../components/juegos/ArrastreEngine';
import DeletreoEngine from '../components/juegos/DeletreoEngine';
import QuizEngine from '../components/juegos/QuizEngine';
import PausaActivaEngine from '../components/juegos/PausaActivaEngine';

const PERSONAJES_META = {
  leo: { nombre: 'Leo', color: '#b45309', bg: '#fef3c7', icon: '🦁' },
  lulu: { nombre: 'Lulú', color: '#0369a1', bg: '#e0f2fe', icon: '🐳' },
  koda: { nombre: 'Koda', color: '#4338ca', bg: '#e0e7ff', icon: '🐻' },
  nia: { nombre: 'Nia', color: '#be123c', bg: '#ffe4e6', icon: '🦊' },
  sora: { nombre: 'Sora', color: '#0f766e', bg: '#ccfbf1', icon: '🦅' },
  bibi: { nombre: 'Bibi', color: '#6d28d9', bg: '#ede9fe', icon: '🐍' }
};

export default function HubActividades() {
  const navigate = useNavigate();
  const { state, isUnlocked, toggleDeveloperMode, getLibraryForCharacter, recordActivity, planApoyo } = useActivities();
  const { activeProfile } = useAuth();

  const [activePersonaje, setActivePersonaje] = useState(null);
  const [activeEje, setActiveEje] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeNivelFilter, setActiveNivelFilter] = useState(null); // null = all, 1, 2, 3
  // Algunos motores disparan onComplete desde un updater de estado (doble invocación
  // en StrictMode): este flag garantiza un solo registro por partida.
  const completadoRef = useRef(false);

  const abrirActividad = (act) => {
    completadoRef.current = false;
    setActiveActivity(act);
  };

  const handleComplete = async (metricasCrudas) => {
    if (completadoRef.current) return;
    completadoRef.current = true;

    const actividad = activeActivity;
    // Cero feedback visual para el niño: la evaluación ocurre "por debajo".
    setTimeout(() => setActiveActivity(null), 1500);
    if (!actividad) return;

    // 1. Telemetría local (motor adaptativo ZDP)
    recordActivity(actividad.motor, metricasCrudas);

    // 2. Registro clínico normalizado → Firestore (dispara el informe de Gemini en el backend)
    const registro = construirRegistroActividad({
      actividad,
      raw: metricasCrudas,
      perfil: activeProfile,
      personajeId: activePersonaje
    });
    console.log('Registro clínico de actividad:', registro);

    if (db) {
      try {
        await addDoc(collection(db, 'telemetria_actividades'), registro);
      } catch (e) {
        console.error('Error guardando telemetría de actividad', e);
      }
    }
  };

  const renderEngine = (act) => {
    const props = {
      nivel: act.nivel,
      onComplete: handleComplete,
      imageSrc: act.imagenAsset
    };

    switch (act.motor) {
      case ENGINE_TYPES.LABERINTO: return <LaberintoJuego {...props} />;
      case ENGINE_TYPES.BUSQUEDA: return <BusquedaVisualJuego {...props} />;
      case ENGINE_TYPES.ROMPECABEZAS: return <RompecabezasEngine {...props} />;
      case ENGINE_TYPES.DIFERENCIAS: return <DiferenciasEngine {...props} />;
      case ENGINE_TYPES.SECUENCIAS: return <SecuenciasEngine {...props} />;
      case ENGINE_TYPES.SOMBRAS: return <SombrasEngine {...props} />;
      case ENGINE_TYPES.MEMORY: return <MemoryEngine {...props} />;
      case ENGINE_TYPES.REVEAL: return <RevealEngine {...props} />;
      case ENGINE_TYPES.COLOR: return <ColorEngine {...props} />;
      case ENGINE_TYPES.TRAZO: return <TrazoEngine {...props} />;
      case ENGINE_TYPES.ARRASTRE: return <ArrastreEngine {...props} />;
      case ENGINE_TYPES.DELETREO: return <DeletreoEngine {...props} />;
      case ENGINE_TYPES.QUIZ: return <QuizEngine {...props} />;
      case ENGINE_TYPES.PAUSA_ACTIVA: return <PausaActivaEngine {...props} />;
      default: return <div>Motor no encontrado</div>;
    }
  };

  if (activeActivity) {
    return (
      <div style={{ width: '100vw', height: '100dvh', position: 'relative' }}>
        <button
          onClick={() => setActiveActivity(null)}
          style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', right: 20, zIndex: 100, padding: '12px 20px', minHeight: '44px', borderRadius: '15px', border: 'none', background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Juego
        </button>
        {renderEngine(activeActivity)}
      </div>
    );
  }

  return (
    <div style={{
      height: '100dvh', backgroundColor: '#f7f3eb',
      padding: 'calc(1rem + env(safe-area-inset-top)) clamp(1rem, 4vw, 2rem) calc(90px + env(safe-area-inset-bottom)) clamp(1rem, 4vw, 2rem)',
      fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
        <div>
          <button
            onClick={() => {
              if (activeNivelFilter) setActiveNivelFilter(null);
              else if (activeEje) setActiveEje(null);
              else if (activePersonaje) setActivePersonaje(null);
              else navigate('/');
            }}
            style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', padding: '8px 12px 8px 0', marginBottom: '0.25rem' }}
          >
            ← Volver
          </button>
          <h1 style={{ color: '#334155', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: 0 }}>
            {activePersonaje ? `Biblioteca de ${PERSONAJES_META[activePersonaje].nombre}` : 'Biblioteca Maestra VANI'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 'clamp(0.95rem, 3vw, 1.2rem)', margin: '0.5rem 0 0 0' }}>
            {activePersonaje ? 'Elige una categoría de entrenamiento.' : 'Selecciona un personaje para ver sus actividades.'}
          </p>
        </div>

        {/* Toggle Modo Desarrollador (solo en entorno de desarrollo) */}
        {import.meta.env.DEV && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '1.5rem' }}>🛠️</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }}>
              Modo Dev
              <input type="checkbox" checked={state.developerMode} onChange={toggleDeveloperMode} style={{ width: '20px', height: '20px' }} />
            </label>
          </div>
        )}
      </div>
      
      {/* Banner de Plan de Apoyo activo */}
      {planApoyo?.gaps?.length > 0 && (
        <div style={{
          flexShrink: 0, background: '#fefce8', border: '1px solid #fde047', borderRadius: '16px',
          padding: '12px 18px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <p style={{ margin: 0, color: '#713f12', fontSize: '0.95rem', lineHeight: '1.4' }}>
            <strong>Plan de apoyo activo:</strong> Vani está enfocando las actividades en{' '}
            {planApoyo.gaps.map(g => NOMBRES_HABILIDAD[g.habilidad || g] || g.habilidad || g).join(', ')}.
            Las demás se desbloquearán al cerrar estas brechas.
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        
        {/* NIVEL 1: Personajes */}
        {!activePersonaje && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {Object.entries(PERSONAJES_META).map(([id, meta]) => (
              <div 
                key={id} onClick={() => setActivePersonaje(id)}
                style={{ 
                  background: meta.bg, padding: '2rem', borderRadius: '24px', cursor: 'pointer', 
                  transition: 'transform 0.2s', border: `3px solid ${meta.color}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{meta.icon}</div>
                <h2 style={{ color: meta.color, margin: 0, fontSize: '2rem' }}>{meta.nombre}</h2>
                <div style={{ marginTop: '1rem', background: 'white', padding: '5px 15px', borderRadius: '15px', color: meta.color, fontWeight: 'bold' }}>
                  {MASTER_LIBRARY[id]?.length || 0} Actividades
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NIVEL 2: Ejes Cognitivos */}
        {activePersonaje && !activeEje && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {['ATENCION', 'MEMORIA', 'LECTURA'].map(eje => (
              <div 
                key={eje} onClick={() => setActiveEje(eje)}
                style={{ 
                  background: 'white', padding: '2rem', borderRadius: '24px', cursor: 'pointer', 
                  transition: 'transform 0.2s', border: `2px solid #cbd5e1`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {eje === 'ATENCION' ? '🎯' : eje === 'MEMORIA' ? '🧩' : '📖'}
                </div>
                <h2 style={{ color: '#334155', margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>
                  {eje === 'ATENCION' ? 'Foco y Atención' : eje === 'MEMORIA' ? 'Lógica y Memoria' : 'Lectoescritura'}
                </h2>
              </div>
            ))}
          </div>
        )}

        {/* NIVEL 3: Grid de Actividades */}
        {activePersonaje && activeEje && (
          <div>
            {/* Barra de Filtros de Dificultad */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setActiveNivelFilter(null)}
                style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: activeNivelFilter === null ? PERSONAJES_META[activePersonaje].color : 'white', color: activeNivelFilter === null ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
              >
                Todos los Niveles
              </button>
              {[1, 2, 3].map(n => (
                <button 
                  key={n}
                  onClick={() => setActiveNivelFilter(n)}
                  style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: activeNivelFilter === n ? PERSONAJES_META[activePersonaje].color : 'white', color: activeNivelFilter === n ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                >
                  Nivel {n}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              {getLibraryForCharacter(activePersonaje)
                .filter(a => a.eje === activeEje && (activeNivelFilter === null || a.nivel === activeNivelFilter))
                .map((act, idx) => {
                const unlocked = act.isUnlocked;
                const isAiLocked = act.aiLocked;
                const isPlanLocked = act.planLocked;

                return (
                  <div 
                    key={act.id} 
                    onClick={() => {
                      if (unlocked) abrirActividad(act);
                    }}
                    style={{ 
                      background: 'white', borderRadius: '16px', overflow: 'hidden', cursor: unlocked ? 'pointer' : 'not-allowed',
                      border: unlocked ? `2px solid ${PERSONAJES_META[activePersonaje].color}` : '2px solid #e2e8f0',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative', opacity: unlocked ? 1 : 0.7
                    }}
                  >
                    <div style={{ width: '100%', height: '120px', background: '#f8fafc', backgroundImage: `url(${act.imagenAsset})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: unlocked ? 'none' : 'grayscale(100%) blur(2px)' }} />
                    
                    {!unlocked && (
                      <div
                        title={isPlanLocked ? 'Bloqueada por plan de apoyo: primero las actividades dirigidas' : isAiLocked ? 'Se desbloquea al ganar más experiencia' : 'Bloqueada'}
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -70%)', fontSize: '2rem', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isPlanLocked ? '🎯' : isAiLocked ? '🌱' : '🔒'}
                      </div>
                    )}

                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {act.motor}
                      </div>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 'bold', marginTop: '4px' }}>
                        Nivel {act.nivel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      <BottomNav />
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
