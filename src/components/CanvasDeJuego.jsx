import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vaniData } from '../data/vaniData';
import { ENGINE_TYPES } from '../data/actividadesData';

// Motores Universales
import LaberintoJuego from './juegos/LaberintoJuego'; // Alias: LaberintoEngine
import BusquedaVisualJuego from './juegos/BusquedaVisualJuego'; // Alias: BusquedaVisualEngine
import RompecabezasEngine from './juegos/RompecabezasEngine';
import DiferenciasEngine from './juegos/DiferenciasEngine';
import SecuenciasEngine from './juegos/SecuenciasEngine';
import SombrasEngine from './juegos/SombrasEngine';
import MemoryEngine from './juegos/MemoryEngine';
import RevealEngine from './juegos/RevealEngine';
import ColorEngine from './juegos/ColorEngine';
import TrazoEngine from './juegos/TrazoEngine';
import ArrastreEngine from './juegos/ArrastreEngine';
import DeletreoEngine from './juegos/DeletreoEngine';
import QuizEngine from './juegos/QuizEngine';
import PausaActivaEngine from './juegos/PausaActivaEngine';

export default function CanvasDeJuego() {
  const { personaje } = useParams();
  const navigate = useNavigate();
  const [activeActivity, setActiveActivity] = useState(null); // null | 'bioma' | 'quiz' | 'spelling'
  const [completed, setCompleted] = useState({ bioma: false, quiz: false, spelling: false });

  const capData = vaniData.capitulos[`${personaje}_0`];
  const pData = vaniData.personajes[personaje];

  if (!pData || !capData) {
    return <div>Juego o personaje no encontrado</div>;
  }

  const handleCompleteActivity = (activityKey) => {
    setCompleted(prev => ({ ...prev, [activityKey]: true }));
    setActiveActivity(null);
  };

  // Render the core biome game
  const renderBiomeGame = () => {
    const handleBack = () => setActiveActivity(null);
    const handleWin = () => handleCompleteActivity('bioma');
    
    // We modify navigate behavior in games or wrap them.
    // For simplicity, we override window.history or wrap components. But since we created the files,
    // we can pass down callbacks or simply render them.
    // To make it very robust without modifying the child components, we can let them complete and return.
    // However, since we want them to go back to our Hub, let's wrap them or implement a custom callback, 
    // or we can let them write directly to completed. Since they call navigate('/ecoesfera/...'), we can hijack navigation or 
    // just let them return to selection.
    // To handle this cleanly, we can temporarily inject custom callback or use state hooks.
    // Let's implement the wrapper: we can override navigate temporarily or provide the Canvas games directly.
    // Wait, let's look at how CanvasLeo/CanvasKoda call navigate:
    // CanvasLeo: navigate('/ecoesfera/tierra')
    // Let's modify CanvasLeo, CanvasKoda, etc., to take an optional `onComplete` prop, and fallback to navigate.
    // Or we can just let them navigate, but it's much better to intercept or pass a prop!
    // Let's check how we can render them. Since we are rendering them inside CanvasDeJuego, 
    // we can pass onComplete! Let's check if the components support it. They don't support it yet, 
    // but we can modify them or wrap them by intercepting navigate or just updating them.
    // Actually, let's update CanvasLeo, CanvasKoda, CanvasNia, CanvasLulu, CanvasSora, CanvasBibi to check:
    // `if (props.onComplete) props.onComplete() else navigate(...)`
    // Wait! A very elegant way is to pass a custom navigate function via React Context or just edit the files.
    // Let's edit the games files to support `onComplete` prop if provided!
    // Yes! That's super clean. Let's do that. But first, let's write CanvasDeJuego.jsx.
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      backgroundColor: '#fef3c7',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      {activeActivity === null && (
        <HubSelection 
          personaje={pData} 
          completed={completed} 
          onSelect={setActiveActivity} 
          onBack={() => navigate(`/personaje/${personaje}`)} 
        />
      )}

      {activeActivity === 'bioma' && (
        <div style={{ width: '100%', height: '100%' }}>
          <DynamicBiomeGame 
            personajeId={personaje} 
            capituloNum={1} /* Hardcodeado a 1 por ahora, hasta conectar con progreso real */
            onComplete={() => handleCompleteActivity('bioma')} 
            onBack={() => setActiveActivity(null)} 
          />
        </div>
      )}

      {activeActivity === 'quiz' && (
        <QuizView 
          quizList={capData.quiz} 
          onComplete={() => handleCompleteActivity('quiz')} 
          onBack={() => setActiveActivity(null)} 
        />
      )}

      {activeActivity === 'spelling' && (
        <SpellingView 
          palabras={Object.entries(capData.palabrasMagicas).map(([word, obj]) => ({ word, ...obj }))} 
          onComplete={() => handleCompleteActivity('spelling')} 
          onBack={() => setActiveActivity(null)} 
        />
      )}
    </div>
  );
}

import { useTelemetry } from '../hooks/useTelemetry';
import { useActivities } from '../hooks/useActivities';

// --- DYNAMIC BIOME GAME (CONSUME useActivities) ---
function DynamicBiomeGame({ personajeId, capituloNum, onComplete, onBack }) {
  const [faseActual, setFaseActual] = useState(0); // Index 0, 1, 2 for the 3 activities
  const [validatedImage, setValidatedImage] = useState(null);
  const { recordActivity } = useTelemetry();
  const { getActivitiesForChapter } = useActivities();
  
  // Nivel de dificultad heurístico: 1 (caps 1-5), 2 (caps 6-10), 3 (caps 11-15)
  const nivel = capituloNum <= 5 ? 1 : capituloNum <= 10 ? 2 : 3;
  
  // Obtenemos las 3 actividades persistentes para este capítulo (1 de cada eje)
  const [actividades, setActividades] = useState([]);

  React.useEffect(() => {
    const acts = getActivitiesForChapter(personajeId, capituloNum, nivel);
    setActividades(acts);
  }, [personajeId, capituloNum, nivel, getActivitiesForChapter]);

  const actividadActual = actividades[faseActual];

  // Lógica de fallback para imágenes
  React.useEffect(() => {
    if (!actividadActual) return;
    setValidatedImage(null); // Reset while loading
    const img = new Image();
    img.src = actividadActual.imagenAsset;
    img.onload = () => setValidatedImage(actividadActual.imagenAsset);
    img.onerror = () => setValidatedImage('/leo_cuento1_1.png'); // Fallback seguro
  }, [actividadActual]);

  const handleEngineComplete = (metricasSilenciosas) => {
    console.log(`Fase ${faseActual + 1} Completada:`, metricasSilenciosas);
    
    if (metricasSilenciosas) {
      recordActivity(actividadActual.motor, metricasSilenciosas);
    }
    
    if (faseActual < 2) {
      setFaseActual(prev => prev + 1);
    } else {
      // Hemos completado las 3 fases del bioma!
      onComplete();
    }
  };

  const renderEngine = () => {
    if (actividades.length === 0) {
      return <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Cargando actividades...</div>;
    }
    if (!validatedImage) {
      return <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Cargando motor mágico...</div>;
    }

    const props = {
      nivel: actividadActual.nivel,
      onComplete: handleEngineComplete,
      imageSrc: validatedImage
    };

    switch (actividadActual.motor) {
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <button 
        onClick={onBack}
        style={{
          position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>
      
      {/* Progreso Visual de Fases */}
      <div style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', right: 20, zIndex: 100, display: 'flex', gap: '8px' }}>
        {[1, 2, 3].map(f => (
          <div key={f} style={{
            width: '16px', height: '16px', borderRadius: '50%',
            backgroundColor: f <= faseActual ? '#10b981' : 'white',
            border: '2px solid #10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }} />
        ))}
      </div>

      {renderEngine()}
    </div>
  );
}

// --- HUB SELECTION COMPONENT ---
function HubSelection({ personaje, completed, onSelect, onBack }) {
  const allDone = completed.bioma && completed.quiz && completed.spelling;
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', boxSizing: 'border-box', backgroundColor: '#fffbeb', textAlign: 'center'
    }}>
      {/* Botón Volver */}
      <button 
        onClick={onBack}
        style={{
          position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      <div style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ color: '#78350f', fontSize: '2.2rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>
          Actividades de {personaje.nombre}
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 2.5rem 0' }}>
          Completa las 3 actividades del bioma para despertar las habilidades del personaje.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
          {/* Actividad 1: El Bioma */}
          <button
            onClick={() => onSelect('bioma')}
            style={{
              padding: '1.2rem', borderRadius: '24px', border: '2px solid #fcd34d',
              background: completed.bioma ? '#ecfdf5' : 'white',
              color: '#78350f', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              minHeight: '80px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '2rem' }}>🎮</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Juego del Bioma</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>Habilidad Visomotora</div>
              </div>
            </div>
            <span style={{ fontSize: '1.8rem' }}>{completed.bioma ? '⭐' : '▶️'}</span>
          </button>

          {/* Actividad 2: Quiz de Comprensión */}
          <button
            onClick={() => onSelect('quiz')}
            style={{
              padding: '1.2rem', borderRadius: '24px', border: '2px solid #fcd34d',
              background: completed.quiz ? '#ecfdf5' : 'white',
              color: '#78350f', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              minHeight: '80px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '2rem' }}>🤔</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Quiz de Comprensión</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>Valores y Comprensión</div>
              </div>
            </div>
            <span style={{ fontSize: '1.8rem' }}>{completed.quiz ? '⭐' : '▶️'}</span>
          </button>

          {/* Actividad 3: Desafío de Ortografía */}
          <button
            onClick={() => onSelect('spelling')}
            style={{
              padding: '1.2rem', borderRadius: '24px', border: '2px solid #fcd34d',
              background: completed.spelling ? '#ecfdf5' : 'white',
              color: '#78350f', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              minHeight: '80px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '2rem' }}>✏️</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Desafío de Palabras</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>Ortografía y Vocabulario</div>
              </div>
            </div>
            <span style={{ fontSize: '1.8rem' }}>{completed.spelling ? '⭐' : '▶️'}</span>
          </button>
        </div>

        {allDone && (
          <div style={{
            marginTop: '2.5rem', padding: '2rem', borderRadius: '32px',
            backgroundColor: '#CCFBF1', border: '2px solid #0D9488',
            animation: 'fadeIn 0.5s ease'
          }}>
            <h2 style={{ color: '#115E59', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
              ¡Habilidades Despiertas! 🌟
            </h2>
            <p style={{ color: '#115E59', fontSize: '1rem', marginTop: '8px', marginBottom: '1.5rem' }}>
              Completaste todas las actividades del capítulo.
            </p>
            <button
              onClick={onBack}
              style={{
                width: '100%', height: '64px', borderRadius: '16px',
                backgroundColor: '#0D9488', color: 'white', border: 'none',
                fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: 'none'
              }}
            >
              Regresar al Mapa 👍
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- QUIZ VIEW COMPONENT ---
function QuizView({ quizList, onComplete, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null); // null | index
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = quizList[currentIdx];
  const synth = window.speechSynthesis;

  const handleOptionClick = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    const isCorrect = idx === question.correcta;
    if (isCorrect) setScore(s => s + 1);

    // TTS feedback
    if (synth) {
      synth.cancel();
      const feedbackText = isCorrect ? '¡Correcto! Muy bien.' : 'Buen intento, la próxima saldrá mejor.';
      const utterance = new SpeechSynthesisUtterance(feedbackText);
      utterance.lang = 'es-ES';
      synth.speak(utterance);
    }

    setTimeout(() => {
      setSelectedOpt(null);
      if (currentIdx < quizList.length - 1) {
        setCurrentIdx(c => c + 1);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const speakQuestion = () => {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(question.pregunta);
    utterance.lang = 'es-ES';
    synth.speak(utterance);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', boxSizing: 'border-box', backgroundColor: '#fffbeb', position: 'relative'
    }}>
      {/* Botón Volver al Hub */}
      <button 
        onClick={onBack}
        style={{
          position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {!showResult ? (
        <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#b45309', fontWeight: 'bold', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '10px' }}>
            {question.categoria} • Pregunta {currentIdx + 1} de 3
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#78350f', fontSize: '1.6rem', margin: 0, fontWeight: 'bold', lineHeight: '1.4' }}>
              {question.pregunta}
            </h2>
            <button
              onClick={speakQuestion}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#fcd34d', border: 'none', fontSize: '1.2rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(251,191,36,0.3)'
              }}
              title="Escuchar pregunta"
            >
              🔊
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {question.opciones.map((opt, i) => {
              let bg = 'white';
              let border = '2px solid #fcd34d';
              if (selectedOpt !== null) {
                if (i === question.correcta) {
                  bg = '#f0fdfa'; // Verde agua muy suave
                  border = '2px solid #0D9488';
                } else if (selectedOpt === i) {
                  bg = '#fff5f5'; // Rojo/coral muy suave
                  border = '2px solid #f87171';
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  style={{
                    padding: '1.2rem', borderRadius: '20px', border, background,
                    color: '#374151', fontSize: '1.15rem', fontWeight: '500', cursor: 'pointer',
                    minHeight: '64px', textAlign: 'left', transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h2 style={{ color: '#78350f', fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '8px' }}>
            ¡Quiz Completado!
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.2rem', margin: '0 0 2rem 0' }}>
            Respondiste {score} de 3 preguntas correctamente.
          </p>
          <button
            onClick={onComplete}
            style={{
              width: '100%', height: '64px', borderRadius: '16px',
              backgroundColor: '#d97706', color: 'white', border: 'none',
              fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(217,119,6,0.3)'
            }}
          >
            Continuar 👍
          </button>
        </div>
      )}
    </div>
  );
}

// --- SPELLING/WORD PUZZLE VIEW COMPONENT ---
function SpellingView({ palabras, onComplete, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [letters, setLetters] = useState([]); // Scrambled letter objects { char, id, used }
  const [spelled, setSpelled] = useState([]); // Array of char
  const [feedback, setFeedback] = useState('Ordena las letras para formar la palabra mágica');
  const [showResult, setShowResult] = useState(false);

  const activePalabra = palabras[currentIdx];
  const targetWord = activePalabra ? activePalabra.word.toLowerCase() : '';
  const synth = window.speechSynthesis;

  useEffect(() => {
    if (activePalabra) {
      prepareLetters(activePalabra.word);
    }
  }, [currentIdx, palabras]);

  const prepareLetters = (word) => {
    setSpelled([]);
    setFeedback('Ordena las letras para formar la palabra mágica');
    const chars = word.toLowerCase().split('');
    const scrambled = chars.map((char, idx) => ({
      char,
      id: idx,
      used: false
    })).sort(() => Math.random() - 0.5);
    setLetters(scrambled);
  };

  const handleLetterClick = (letterObj) => {
    if (letterObj.used) return;

    const nextSpelled = [...spelled, letterObj.char];
    setSpelled(nextSpelled);
    setLetters(prev => prev.map(l => l.id === letterObj.id ? { ...l, used: true } : l));

    // Check if spelling has gone wrong so far
    const currentSpelledStr = nextSpelled.join('');
    if (!targetWord.startsWith(currentSpelledStr)) {
      setFeedback('¡Oops, esa letra no va ahí! Intenta reconstruir.');
      // Reset after a brief moment
      setTimeout(() => {
        setSpelled([]);
        setLetters(prev => prev.map(l => ({ ...l, used: false })));
        setFeedback('Comencemos de nuevo con calma.');
      }, 1200);
      return;
    }

    if (currentSpelledStr === targetWord) {
      setFeedback('¡Correcto! ¡Escribiste la palabra! 🎉');
      
      // TTS read word definition
      if (synth) {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(`${targetWord}. ${activePalabra.definicion}`);
        utterance.lang = 'es-ES';
        synth.speak(utterance);
      }

      setTimeout(() => {
        if (currentIdx < palabras.length - 1) {
          setCurrentIdx(c => c + 1);
        } else {
          setShowResult(true);
        }
      }, 2500);
    }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', boxSizing: 'border-box', backgroundColor: '#fffbeb', position: 'relative'
    }}>
      {/* Botón Volver */}
      <button 
        onClick={onBack}
        style={{
          position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px', width: '64px', height: '64px',
          borderRadius: '50%', background: 'white', border: 'none', color: '#64748b', 
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {!showResult ? (
        <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#b45309', fontWeight: 'bold', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '10px' }}>
            Desafío Ortográfico • Palabra {currentIdx + 1} de {palabras.length}
          </span>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            padding: '1.2rem 2rem',
            borderRadius: '24px',
            border: '1px solid #fde68a',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#78350f', fontWeight: 'bold', marginBottom: '4px' }}>Pista / Definición:</p>
            <p style={{ margin: 0, fontSize: '1.15rem', color: '#4b5563', lineHeight: '1.5' }}>"{activePalabra.definicion}"</p>
          </div>

          {/* Feedback */}
          <p style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '2.5rem', textAlign: 'center', minHeight: '1.5rem' }}>
            {feedback}
          </p>

          {/* Palabra Formada */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '3rem', minHeight: '60px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {targetWord.split('').map((_, i) => (
              <div
                key={i}
                style={{
                  width: '50px',
                  height: '50px',
                  borderBottom: '3px solid #d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#78350f',
                  textTransform: 'uppercase'
                }}
              >
                {spelled[i] || ''}
              </div>
            ))}
          </div>

          {/* Letras para Seleccionar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {letters.map(letter => (
              <button
                key={letter.id}
                onClick={() => handleLetterClick(letter)}
                disabled={letter.used}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: letter.used ? '#e5e7eb' : 'white',
                  border: letter.used ? '2px solid #d1d5db' : '2px solid #fcd34d',
                  color: letter.used ? '#9ca3af' : '#78350f',
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: letter.used ? 'default' : 'pointer',
                  boxShadow: letter.used ? 'none' : '0 4px 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.1s ease',
                  outline: 'none'
                }}
              >
                {letter.char}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🏆</span>
          <h2 style={{ color: '#78350f', fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '8px' }}>
            ¡Ortografía Impecable!
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.2rem', margin: '0 0 2rem 0' }}>
            Lograste escribir correctamente todas las palabras mágicas del bioma.
          </p>
          <button
            onClick={onComplete}
            style={{
              width: '100%', height: '64px', borderRadius: '16px',
              backgroundColor: '#d97706', color: 'white', border: 'none',
              fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(217,119,6,0.3)'
            }}
          >
            Continuar 👍
          </button>
        </div>
      )}
    </div>
  );
}
