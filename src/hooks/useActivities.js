import { useState, useEffect, useCallback } from 'react';
import { MASTER_LIBRARY } from '../data/actividadesData';
import { useTelemetry } from './useTelemetry';
import { evaluateZDP } from '../utils/aiAdaptiveEngine';

// Storage Key
const STORAGE_KEY = 'vani_activities_state';

// Helper aleatorio
const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const useActivities = () => {
  const { telemetry } = useTelemetry();
  
  const [state, setState] = useState({
    assignments: {}, // { "leo_capitulo_1": ["id1", "id2", "id3"] }
    unlockedIds: [], // ["id1", "id2", ...]
    developerMode: false
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch(e) {
        console.error("Error parsing activities state", e);
      }
    }
  }, []);

  const saveState = (newState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  /**
   * Obtiene las 3 actividades asignadas a un capítulo. 
   * Si no existen, las asigna permanentemente (una de cada eje).
   */
  const getActivitiesForChapter = useCallback((personaje, capitulo, nivelDificultad = 1) => {
    const key = `${personaje}_capitulo_${capitulo}`;
    
    // Si ya existen, retornarlas
    if (state.assignments[key]) {
      return state.assignments[key]
        .map(id => MASTER_LIBRARY[personaje]?.find(a => a.id === id))
        .filter(Boolean);
    }

    // Si no existen, crear una nueva asignación: 1 de Atencion, 1 de Memoria, 1 de Lectura
    const actPersonaje = MASTER_LIBRARY[personaje] || [];
    
    const atencion = actPersonaje.filter(a => a.eje === 'ATENCION' && a.nivel === nivelDificultad);
    const memoria = actPersonaje.filter(a => a.eje === 'MEMORIA' && a.nivel === nivelDificultad);
    const lectura = actPersonaje.filter(a => a.eje === 'LECTURA' && a.nivel === nivelDificultad);

    // Fallback if not enough at that exact level
    const atencionFinal = atencion.length > 0 ? atencion : actPersonaje.filter(a => a.eje === 'ATENCION');
    const memoriaFinal = memoria.length > 0 ? memoria : actPersonaje.filter(a => a.eje === 'MEMORIA');
    const lecturaFinal = lectura.length > 0 ? lectura : actPersonaje.filter(a => a.eje === 'LECTURA');

    const selectedIds = [
      ...getRandomElements(atencionFinal, 1),
      ...getRandomElements(memoriaFinal, 1),
      ...getRandomElements(lecturaFinal, 1)
    ].map(a => a.id);

    // Actualizar estado: Asignar y Desbloquear
    const newState = {
      ...state,
      assignments: {
        ...state.assignments,
        [key]: selectedIds
      },
      unlockedIds: [...new Set([...state.unlockedIds, ...selectedIds])]
    };

    saveState(newState);

    return selectedIds.map(id => MASTER_LIBRARY[personaje].find(a => a.id === id));
  }, [state]);

  /**
   * Verifica si una actividad está desbloqueada por progreso de la historia
   */
  const isUnlocked = useCallback((activityId) => {
    if (state.developerMode) return true;
    return state.unlockedIds.includes(activityId);
  }, [state]);

  /**
   * Obtiene la librería completa de un personaje con el estado de desbloqueo,
   * y bloquea por IA (aiLocked) si el nivel supera el recomendado.
   */
  const getLibraryForCharacter = useCallback((personaje) => {
    const recommendedMaxLevel = evaluateZDP(telemetry);
    const acts = MASTER_LIBRARY[personaje] || [];
    
    return acts.map(a => {
      const unlockedByStory = isUnlocked(a.id);
      const isTooHard = a.nivel > recommendedMaxLevel;
      
      // Si estamos en developer mode, sobreescribimos todo
      const finalUnlocked = state.developerMode ? true : (unlockedByStory && !isTooHard);
      
      return {
        ...a,
        isUnlocked: finalUnlocked,
        aiLocked: !state.developerMode && unlockedByStory && isTooHard // Bloqueado por IA porque supera ZDP a pesar de estar descubierto
      };
    });
  }, [isUnlocked, MASTER_LIBRARY, telemetry, state.developerMode]);

  const toggleDeveloperMode = () => {
    saveState({
      ...state,
      developerMode: !state.developerMode
    });
  };

  return {
    state,
    getActivitiesForChapter,
    isUnlocked,
    getLibraryForCharacter,
    toggleDeveloperMode,
    recommendedMaxLevel: evaluateZDP(telemetry)
  };
};
