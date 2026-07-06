import { useEffect, useRef } from 'react';

// Scroll automático de un contenedor de texto sincronizado con la narración de Vani.
// Permite mostrar diálogos largos en cajas compactas: el texto avanza junto con la voz.
//
// - isSpeaking: bandera de narración activa (audio pregrabado o TTS)
// - audioRef: ref a un HTMLAudioElement si existe (sincroniza con currentTime/duration)
// - text: texto narrado, para estimar la duración cuando no hay metadata de audio (TTS)
//
// El niño conserva el control: al tocar o scrollear manualmente, el auto-scroll se
// detiene hasta que la narración vuelva a empezar. Devuelve el ref para el contenedor
// scrolleable (overflowY: auto).
export function useNarracionScroll({ isSpeaking, audioRef = null, text = '' }) {
  const scrollRef = useRef(null);
  const interruptedRef = useRef(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const marcarInterrumpido = () => { interruptedRef.current = true; };
    el.addEventListener('wheel', marcarInterrumpido, { passive: true });
    el.addEventListener('touchstart', marcarInterrumpido, { passive: true });
    return () => {
      el.removeEventListener('wheel', marcarInterrumpido);
      el.removeEventListener('touchstart', marcarInterrumpido);
    };
  }, []);

  useEffect(() => {
    if (!isSpeaking) return;
    const el = scrollRef.current;
    if (!el) return;

    interruptedRef.current = false;
    startTimeRef.current = performance.now();
    // Sin metadata de audio: ~2.2 palabras por segundo (voz pausada para niños)
    const palabras = text.split(/\s+/).filter(Boolean).length;
    const duracionEstimadaS = Math.max(4, palabras / 2.2);
    let frameId;

    const step = () => {
      if (interruptedRef.current) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        let progreso;
        const audio = audioRef?.current;
        if (audio && audio.duration && !Number.isNaN(audio.duration) && audio.duration !== Infinity) {
          progreso = audio.currentTime / audio.duration;
        } else {
          progreso = (performance.now() - startTimeRef.current) / 1000 / duracionEstimadaS;
        }
        // Margen inicial/final: la primera y la última línea se leen sin movimiento
        const ajustado = Math.min(1, Math.max(0, (progreso - 0.12) / 0.76));
        el.scrollTop = maxScroll * ajustado;
      }
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [isSpeaking, audioRef, text]);

  return scrollRef;
}
