import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vaniData } from '../data/vaniData';
import VaniGuide from '../components/VaniGuide';
import BackButton from '../components/BackButton';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useResponsive } from '../hooks/useResponsive';

export default function Capitulo() {
  const { personajeId, capituloId } = useParams();
  const navigate = useNavigate();
  const { isTabletLandscape } = useResponsive();
  const personaje = vaniData.personajes[personajeId];
  const capituloData = vaniData.capitulos[`${personajeId}_${capituloId}`];

  const [estado, setEstado] = useState('INTRO'); // 'INTRO' | 'LECTURA' | 'BIFURCACION' | 'TEST_PREPARACION' | 'TEST_CUENTA_REGRESIVA' | 'TEST_LEYENDO' | 'TEST_RESULTADOS'
  const [escenaIndex, setEscenaIndex] = useState(0);
  const [activeMagicWord, setActiveMagicWord] = useState(null);
  
  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [usoAudio, setUsoAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [useHtml5Audio, setUseHtml5Audio] = useState(false);
  const [audioTimestamps, setAudioTimestamps] = useState(null);
  const [autoPlayRequested, setAutoPlayRequested] = useState(false);

  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Test states
  const [cuenta, setCuenta] = useState(3);
  const [testTiempoS, setTestTiempoS] = useState(0);
  const [testWpm, setTestWpm] = useState(0);
  const testStartTimeRef = useRef(null);

  // Derive data
  const escenas = capituloData ? capituloData.escenas : [];
  const escenaActual = escenas[escenaIndex];
  const esUltimaEscena = escenaIndex === escenas.length - 1;

  // Concatenated clean text for the reading test
  const textoCompletoTest = React.useMemo(() => {
    if (!escenas) return '';
    return escenas.map(e => {
      return e.texto.replace(/\[(.*?)\]\(magic-word:(.*?)\)/g, '$1');
    }).join(' ');
  }, [escenas]);

  const palabrasTotalesTest = React.useMemo(() => {
    return textoCompletoTest.split(/\s+/).filter(Boolean).length;
  }, [textoCompletoTest]);

  // Parse text to support Magic Words [word](magic-word:id) and get clean text for karaoke/TTS
  const { textoLimpio, parsedWords } = React.useMemo(() => {
    if (!escenaActual) return { textoLimpio: 'Cargando...', parsedWords: [] };
    const rawText = escenaActual.texto;
    const regex = /\[(.*?)\]\(magic-word:(.*?)\)/g;
    const clean = rawText.replace(regex, '$1');
    const wordsRaw = rawText.split(/\s+/);
    let currentCharIndex = 0;
    
    const words = wordsRaw.map((wordRaw) => {
      const match = wordRaw.match(/^([^\[]*?)\[(.*?)\]\(magic-word:(.*?)\)([^\]]*?)$/);
      let displayText = wordRaw;
      let isMagic = false;
      let magicId = null;
      
      if (match) {
        displayText = match[1] + match[2] + match[4];
        isMagic = true;
        magicId = match[3];
      }
      
      // Calculate start and end indices in the clean text
      const searchArea = clean.substring(currentCharIndex);
      const relativeIndex = searchArea.indexOf(displayText);
      let startIndex = currentCharIndex;
      if (relativeIndex !== -1) {
        startIndex = currentCharIndex + relativeIndex;
        currentCharIndex = startIndex + displayText.length;
      } else {
        currentCharIndex += wordRaw.length + 1;
      }
      
      return {
        raw: wordRaw,
        displayText,
        isMagic,
        magicId,
        startIndex,
        endIndex: startIndex + displayText.length
      };
    });
    
    return { textoLimpio: clean, parsedWords: words };
  }, [escenaActual]);

  const palabrasCount = parsedWords.length;

  const startAudioPolling = () => {
    if (!audioRef.current || !audioTimestamps) return;
    
    const poll = () => {
      if (!audioRef.current || !audioTimestamps) return;
      const timeMs = audioRef.current.currentTime * 1000;
      
      let foundIndex = -1;
      for (let i = 0; i < audioTimestamps.length; i++) {
        const w = audioTimestamps[i];
        if (timeMs >= w.start && timeMs <= w.end) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex === -1) {
        for (let i = 0; i < audioTimestamps.length; i++) {
          const w = audioTimestamps[i];
          const nextW = audioTimestamps[i + 1];
          if (timeMs >= w.end && (!nextW || timeMs < nextW.start)) {
            if (timeMs - w.end < 300 || !nextW) {
              foundIndex = i;
            }
            break;
          }
        }
      }
      
      setActiveWordIndex(foundIndex);
      animationFrameIdRef.current = requestAnimationFrame(poll);
    };
    
    animationFrameIdRef.current = requestAnimationFrame(poll);
  };

  const stopAudioPolling = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  // Mount-only effect to initialize and clean up Audio element
  useEffect(() => {
    const audio = new Audio();
    
    const handleEnded = () => {
      setIsPlaying(false);
      setActiveWordIndex(-1);
      stopAudioPolling();
    };
    
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
      stopAudioPolling();
    };
  }, []);

  // Fetch alignment and set up HTML5 Audio
  useEffect(() => {
    if (estado !== 'LECTURA') return;
    
    const audioUrl = `/audio/${personajeId}_${capituloId}_escena${escenaIndex + 1}.mp3`;
    const jsonUrl = `/audio/${personajeId}_${capituloId}_escena${escenaIndex + 1}.json`;
    
    // Reset states (but do NOT reset autoPlayRequested here)
    setUseHtml5Audio(false);
    setAudioTimestamps(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopAudioPolling();
    setIsPlaying(false);
    setActiveWordIndex(-1);
    if (synth) synth.cancel();
    
    fetch(jsonUrl)
      .then(res => {
        if (!res.ok) throw new Error("Alineación no encontrada");
        return res.json();
      })
      .then(data => {
        setAudioTimestamps(data);
        setUseHtml5Audio(true);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          
          if (autoPlayRequested) {
            setUsoAudio(true);
            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
                startAudioPolling();
                setAutoPlayRequested(false); // Consumido
              })
              .catch(err => {
                console.error("Error reproduciendo audio HTML5 en autoplay:", err);
              });
          }
        }
      })
      .catch(err => {
        console.warn("No se pudo cargar el audio de ElevenLabs. Usando síntesis nativa:", err.message);
        setUseHtml5Audio(false);
        setAudioTimestamps(null);
        
        if (autoPlayRequested) {
          setUsoAudio(true);
          const utterance = new SpeechSynthesisUtterance(textoLimpio);
          utterance.lang = 'es-ES';
          utterance.rate = 0.85;
          utterance.pitch = 1.1;
          
          utterance.onboundary = (event) => {
            if (event.name === 'word') {
              const charIndex = event.charIndex;
              const wordIdx = parsedWords.findIndex(w => charIndex >= w.startIndex && charIndex < w.endIndex);
              if (wordIdx !== -1) {
                setActiveWordIndex(wordIdx);
              }
            }
          };

          utterance.onend = () => {
            setIsPlaying(false);
            setActiveWordIndex(-1);
          };

          utteranceRef.current = utterance;
          synth.speak(utterance);
          setIsPlaying(true);
          setAutoPlayRequested(false); // Consumido
        }
      });
  }, [personajeId, capituloId, escenaIndex, estado]);

  // Clean up speech/audio on scene/state change
  useEffect(() => {
    if (synth) synth.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopAudioPolling();
    setIsPlaying(false);
    setActiveWordIndex(-1);
    setActiveMagicWord(null);
  }, [escenaIndex, estado]);

  // Auto-dismiss magic word bubble
  useEffect(() => {
    if (activeMagicWord) {
      const timer = setTimeout(() => {
        setActiveMagicWord(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeMagicWord]);

  const toggleAudio = () => {
    if (useHtml5Audio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        stopAudioPolling();
        setIsPlaying(false);
        setAutoPlayRequested(false); // Cancelar autoplay futuro
      } else {
        if (synth) synth.cancel();
        setUsoAudio(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            startAudioPolling();
          })
          .catch(err => {
            console.error("Error reproduciendo audio HTML5:", err);
          });
      }
    } else {
      if (!synth) return;

      if (isPlaying) {
        synth.cancel();
        setIsPlaying(false);
        setActiveWordIndex(-1);
        setAutoPlayRequested(false); // Cancelar autoplay futuro
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          stopAudioPolling();
        }
        setUsoAudio(true);
        const utterance = new SpeechSynthesisUtterance(textoLimpio);
        utterance.lang = 'es-ES';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const charIndex = event.charIndex;
            const wordIdx = parsedWords.findIndex(w => charIndex >= w.startIndex && charIndex < w.endIndex);
            if (wordIdx !== -1) {
              setActiveWordIndex(wordIdx);
            }
          }
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setActiveWordIndex(-1);
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const startReading = (shouldPlayAudio) => {
    setEstado('LECTURA');
    if (shouldPlayAudio) {
      setAutoPlayRequested(true);
    }
  };

  const handleNextAction = () => {
    if (synth) synth.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopAudioPolling();
    
    if (usoAudio) {
      setAutoPlayRequested(true);
    }
    
    if (!esUltimaEscena) {
      setEscenaIndex(prev => prev + 1);
    } else {
      setEstado('BIFURCACION');
    }
  };

  const iniciarCuentaRegresiva = () => {
    setEstado('TEST_CUENTA_REGRESIVA');
    let c = 3;
    setCuenta(c);
    const interval = setInterval(() => {
      c--;
      if (c > 0) {
        setCuenta(c);
      } else {
        clearInterval(interval);
        setEstado('TEST_LEYENDO');
        testStartTimeRef.current = Date.now();
      }
    }, 1000);
  };

  const terminarLecturaTest = async () => {
    const endTime = Date.now();
    const elapsedSeconds = (endTime - testStartTimeRef.current) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    const calculoWpm = Math.round(palabrasTotalesTest / elapsedMinutes);
    
    setTestTiempoS(Math.round(elapsedSeconds));
    setTestWpm(calculoWpm);
    setEstado('TEST_RESULTADOS');

    const reporte = {
      usuario_id: "jugador_sesion_actual",
      fecha: new Date().toISOString(),
      personaje_id: personajeId,
      capitulo_id: capituloId,
      wpm: calculoWpm,
      tiempo_total_s: elapsedSeconds,
      palabras_totales: palabrasTotalesTest
    };

    console.log(`[Telemetría Clínica] Personaje: ${personajeId}, WPM: ${calculoWpm}, Tiempo: ${elapsedSeconds}s`);
    
    if (db) {
      try {
        await addDoc(collection(db, "telemetria_tests"), reporte);
        console.log("Telemetría de test guardada en Firestore.");
      } catch (e) {
        console.error("Error guardando telemetría de test", e);
      }
    }
  };

  if (!personaje || !capituloData || !escenaActual) return <div>Cargando...</div>;

  return (
    <div style={{
      height: '100dvh', width: '100vw', backgroundColor: '#fcfcfc',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Botón Volver (Siempre accesible salvo si está cargando o en el test) */}
      {!['TEST_PREPARACION', 'TEST_CUENTA_REGRESIVA', 'TEST_LEYENDO', 'TEST_RESULTADOS'].includes(estado) && (
        <BackButton
          onClick={() => {
            if (synth) synth.cancel();
            navigate(`/personaje/${personajeId}`);
          }}
        />
      )}

      {estado === 'INTRO' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef3c7', // Fondo crema cálido
          padding: '2rem',
          position: 'relative',
          height: '100dvh',
          width: '100vw'
        }}>
          <VaniGuide state="idle" />
          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            padding: '2.5rem 2rem',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.4)',
            marginTop: '80px',
            animation: 'fadeIn 0.5s ease'
          }}>
            <h2 style={{ color: '#78350f', margin: '0 0 1rem 0', fontSize: '1.8rem', fontWeight: 'bold' }}>¡Hola! Soy Vani</h2>
            <p style={{ color: '#4b5563', fontSize: '1.2rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
              ¿Quieres que te lea el cuento en voz alta o prefieres leerlo tú solo/a?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <button 
                onClick={() => startReading(true)}
                style={{
                  padding: '1rem 2rem', borderRadius: '16px', background: '#d97706', color: 'white',
                  border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                  minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 4px 15px rgba(217,119,6,0.3)', transition: 'background-color 0.2s'
                }}
              >
                <span>🔊</span> Léeme, Vani
              </button>
              <button 
                onClick={() => startReading(false)}
                style={{
                  padding: '1rem 2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.9)', color: '#78350f',
                  border: '2px solid #fcd34d', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                  minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'background-color 0.2s'
                }}
              >
                <span>📖</span> Leeré yo solo/a
              </button>
            </div>
          </div>
        </div>
      )}

      {estado === 'LECTURA' && (
        <div style={{
          display: 'flex', 
          flexDirection: isTabletLandscape ? 'row' : 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          <VaniGuide state={isPlaying ? 'animar' : 'idle'} />

          {/* Ilustración (Asset Visual) */}
          <div style={{
            flex: isTabletLandscape ? '0 0 65%' : '0 0 45vh', 
            backgroundColor: personaje.imgBg, 
            backgroundImage: `url(${escenaActual.imagenEstatica})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-start', justifyContent: 'center', position: 'relative',
            boxShadow: isTabletLandscape ? '4px 0 15px rgba(0,0,0,0.05)' : '0 4px 15px rgba(0,0,0,0.05)', zIndex: 5,
            transition: 'background-image 1s ease-in-out'
          }}>
            {/* Sombra sutil superior para que el botón de volver no se pierda */}
            <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)'}}></div>
            
            {escenaIndex === 1 && (
              <div className="fog-container" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none'}}>
                <div className="fog"></div>
                <div className="leaves"></div>
                <div className="leaves leaves2"></div>
              </div>
            )}
          </div>

          {/* Área de Texto: zona scrolleable + botonera siempre visible */}
          <div style={{
            flex: isTabletLandscape ? '0 0 35%' : 1, position: 'relative', minHeight: 0,
            display: 'flex', flexDirection: 'column',
            backgroundColor: '#fcfcfc'
          }}>
          <div className="hide-scrollbar" style={{
            flex: 1, minHeight: 0, padding: '1.5rem 1.5rem 0.5rem 1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            overflowY: 'auto', WebkitOverflowScrolling: 'touch'
          }}>
            <div
              style={{
                maxWidth: '700px', width: '100%', position: 'relative'
              }}
            >
              {/* Texto Fragmentado para Karaoke (Cero Fricción: Visible 100% sin blur ni opacidad reducida) */}
              <div style={{
                fontSize: 'clamp(1.15rem, 4.2vw, 1.6rem)', lineHeight: '1.9', color: '#334155',
                margin: 0, textAlign: 'left'
              }}>
                {parsedWords.map((wordObj, index) => {
                  if (wordObj.isMagic) {
                    return (
                      <span key={index} style={{ display: 'inline-block', marginRight: '0.4rem', position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const wordDef = capituloData.palabrasMagicas?.[wordObj.magicId];
                            if (wordDef) {
                              setActiveMagicWord({
                                index: index,
                                word: wordObj.displayText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!]/g, ""),
                                ...wordDef
                              });
                              // Reproducir sutilmente audio (opcional)
                              if (synth) synth.cancel();
                              const wordUtterance = new SpeechSynthesisUtterance(`${wordObj.displayText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!]/g, "")}, ${wordDef.sinonimos[0]}`);
                              wordUtterance.lang = 'es-ES';
                              wordUtterance.rate = 0.85;
                              synth.speak(wordUtterance);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: '3px dashed #d97706',
                            padding: '0 2px',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            color: '#b45309',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-block',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            textShadow: activeWordIndex === index ? '0 0 10px #f59e0b, 0 0 20px #d97706, 0 0 30px #b45309' : 'none',
                          }}
                          className="magic-word-btn"
                        >
                          {wordObj.displayText}
                        </button>
                        
                        {/* Nueva Burbuja Sutil Flotante (Sale de la palabra) */}
                        {activeMagicWord && activeMagicWord.index === index && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            whiteSpace: 'nowrap',
                            animation: 'floatDownAndFade 3s forwards ease-out',
                            pointerEvents: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(5px)',
                            WebkitBackdropFilter: 'blur(5px)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(251,191,36,0.3)',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {activeMagicWord.word}:
                            </span>
                            <span style={{ color: '#4b5563', fontSize: '1.1rem' }}>
                              {activeMagicWord.sinonimos?.[0] || activeMagicWord.definicion.split(' ')[0]}
                            </span>
                          </div>
                        )}
                      </span>
                    );
                  }

                  return (
                    <span 
                      key={index} 
                      style={{
                        display: 'inline-block',
                        marginRight: '0.4rem',
                        color: 'inherit',
                        transition: 'text-shadow 0.2s ease',
                        textShadow: activeWordIndex === index ? '0 0 10px #f59e0b, 0 0 20px #d97706, 0 0 30px #b45309' : 'none',
                        fontWeight: activeWordIndex === index ? '500' : 'normal'
                      }}
                    >
                      {wordObj.displayText}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>

            {/* Botonera de Acción: fija al fondo de la columna, siempre visible sin scroll */}
            <div style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '0.5rem 1.5rem calc(0.75rem + env(safe-area-inset-bottom)) 1.5rem',
              background: 'linear-gradient(to top, #fcfcfc 75%, rgba(252,252,252,0))'
            }}>
            {/* Indicador de escena */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '0.6rem' }}>
              {escenas.map((_, i) => (
                <div key={i} style={{
                  width: i === escenaIndex ? '18px' : '7px', height: '7px', borderRadius: '4px',
                  backgroundColor: i === escenaIndex ? (personaje?.color || '#0D9488') : '#e2e8f0',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
            <div style={{
              display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '400px',
              justifyContent: 'center', alignItems: 'center'
            }}>
              {/* Botón Audio (TTS) */}
              <button 
                onClick={toggleAudio}
                style={{
                  width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
                  background: isPlaying ? '#fef3c7' : '#f1f5f9', border: 'none',
                  fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isPlaying ? '0 0 15px #fde68a' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isPlaying ? '⏸️' : '🔊'}
              </button>
              
              {!esUltimaEscena ? (
                <button 
                  onClick={handleNextAction}
                  style={{
                    flex: 1, height: '60px', borderRadius: '30px', background: personaje?.color || '#0D9488', border: 'none',
                    color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: 'none',
                    minHeight: '64px'
                  }}
                >
                  Siguiente →
                </button>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button 
                    onClick={handleNextAction}
                    style={{
                      width: '80px', height: '80px', borderRadius: '50%', background: 'transparent', border: 'none',
                      cursor: 'pointer', padding: 0,
                      animation: 'pulseSoft 2s infinite',
                      boxShadow: '0 0 30px rgba(230, 168, 92, 0.6)'
                    }}
                  >
                    <img src="/linterna_oro_icon_1781187380020.png" alt="Linterna de Oro" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </button>
                  <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', textAlign: 'center' }}>
                    Toca la linterna para encender el camino
                  </span>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {estado === 'BIFURCACION' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef3c7',
          padding: '2rem',
          height: '100dvh',
          width: '100vw'
        }}>
          <VaniGuide state="exito" />
          <div style={{ 
            width: '100%', 
            maxWidth: '500px', 
            textAlign: 'center', 
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            padding: '3rem 2rem', 
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.4)',
            marginTop: '80px',
            animation: 'fadeIn 0.5s ease' 
          }}>
            <h2 style={{ color: '#78350f', marginBottom: '2rem', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold' }}>¡Has completado la lectura!</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <button 
                onClick={() => navigate(`/juego/${personajeId}`)}
                style={{ 
                  padding: '1.2rem', 
                  borderRadius: '16px', 
                  background: '#d97706', 
                  color: 'white', 
                  border: 'none', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(217,119,6,0.3)',
                  minHeight: '64px'
                }}
              >
                🎮 Ir a las Actividades
              </button>
              <button 
                onClick={() => setEstado('TEST_PREPARACION')}
                style={{ 
                  padding: '1.2rem', 
                  borderRadius: '16px', 
                  background: '#0D9488', 
                  color: 'white', 
                  border: 'none', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  boxShadow: 'none',
                  minHeight: '64px'
                }}
              >
                ⏱️ Hacer el Reto de Lectura (WPM)
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{ 
                  padding: '1.2rem', 
                  borderRadius: '16px', 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  color: '#4b5563', 
                  border: '2px solid #e5e7eb', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  minHeight: '64px'
                }}
              >
                🌍 Volver al Mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ESTADOS DEL TEST TRANSPARENTE UNIFICADOS (Brutalista Clínico Neutro) --- */}
      {estado === 'TEST_PREPARACION' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbfaf7', // Fondo neutro clínica
          padding: '2rem',
          height: '100dvh',
          width: '100vw'
        }}>
          {/* Botón Volver al Menú de Opciones (Bifurcación) */}
          <BackButton
            onClick={() => setEstado('BIFURCACION')}
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', color: '#4a4a4a', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          />
          
          <div style={{ textAlign: 'center', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ color: '#2a241c', fontSize: 'clamp(1.7rem, 6vw, 2.5rem)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              Reto de Velocidad Lectora
            </h1>
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
        </div>
      )}

      {estado === 'TEST_CUENTA_REGRESIVA' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbfaf7',
          padding: '2rem',
          height: '100dvh',
          width: '100vw'
        }}>
          <div style={{ fontSize: '8rem', fontWeight: 'bold', color: '#0D9488', animation: 'pulse 1s infinite' }}>
            {cuenta}
          </div>
        </div>
      )}

      {estado === 'TEST_LEYENDO' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: '#fbfaf7',
          padding: '2rem',
          height: '100dvh',
          width: '100vw',
          overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '60px', paddingBottom: '40px' }}>
            <div style={{
              backgroundColor: 'white', padding: 'clamp(1.25rem, 5vw, 3rem)', borderRadius: '24px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '3rem', width: '100%'
            }}>
              <p style={{
                fontSize: 'clamp(1.25rem, 4.5vw, 1.8rem)', lineHeight: '1.9', color: '#2a241c',
                margin: 0, textAlign: 'left', fontWeight: '500'
              }}>
                {textoCompletoTest}
              </p>
            </div>

            {/* Botón completado - Área táctil de mínimo 64x64px */}
            <button 
              onClick={terminarLecturaTest}
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
        </div>
      )}

      {estado === 'TEST_RESULTADOS' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbfaf7',
          padding: '2rem',
          height: '100dvh',
          width: '100vw'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ color: '#2a241c', fontSize: 'clamp(1.7rem, 6vw, 2.5rem)', marginBottom: '1.5rem', fontWeight: 'bold' }}>¡Excelente trabajo!</h1>
            
            <div style={{ 
              backgroundColor: 'white', padding: '2rem', borderRadius: '20px', 
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '2rem', width: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>PALABRAS POR MINUTO</p>
                  <p style={{ color: '#0D9488', fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{testWpm}</p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>TIEMPO TOTAL</p>
                  <p style={{ color: '#78350F', fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{testTiempoS}s</p>
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
        </div>
      )}

      <style>{`
        @keyframes floatDownAndFade {
          0% { opacity: 0; transform: translate(-50%, -10px) scale(0.9); }
          15% { opacity: 1; transform: translate(-50%, 5px) scale(1); }
          85% { opacity: 1; transform: translate(-50%, 15px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, 30px) scale(0.9); }
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pulseSoft {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(230, 168, 92, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(230, 168, 92, 0.8); }
          100% { transform: scale(1); box-shadow: 0 0 10px rgba(230, 168, 92, 0.2); }
        }
        @keyframes driftFog {
          0% { transform: translateX(-10%); opacity: 0.2; }
          50% { transform: translateX(10%); opacity: 0.5; }
          100% { transform: translateX(-10%); opacity: 0.2; }
        }
        @keyframes fallLeaves {
          0% { transform: translate(50vw, -10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(-50vw, 60vh) rotate(360deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fog {
          position: absolute; width: 200%; height: 100%; top: 0; left: -50%;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
          animation: driftFog 10s ease-in-out infinite;
        }
        .leaves {
          position: absolute; width: 12px; height: 12px; background: #1e293b; border-radius: 50% 0 50% 0;
          box-shadow: 
            30px -50px 0 #334155, 60px 20px 0 #0f172a, 90px -30px 0 #1e293b, 150px 10px 0 #334155,
            200px -60px 0 #0f172a, 240px 40px 0 #1e293b, 280px -10px 0 #334155, 320px 30px 0 #0f172a,
            380px -40px 0 #1e293b, 420px 20px 0 #334155, 480px -20px 0 #0f172a, 550px 50px 0 #1e293b;
          animation: fallLeaves 3.5s linear infinite;
        }
        .leaves2 {
          top: -20vh;
          left: 20vw;
          animation: fallLeaves 4s linear infinite;
          animation-delay: 1.5s;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
