import React, { createContext, useContext, useState, useEffect } from 'react';

const JourneyContext = createContext();

export const useJourney = () => useContext(JourneyContext);

export const JourneyProvider = ({ children }) => {
  const [journeyDay, setJourneyDay] = useState(1);

  // Cargar estado simulado desde LocalStorage al iniciar
  useEffect(() => {
    const savedDay = localStorage.getItem('vani_simulated_journey_day');
    if (savedDay) {
      setJourneyDay(parseInt(savedDay, 10));
    }
  }, []);

  const advanceDay = () => {
    const newDay = journeyDay + 1;
    setJourneyDay(newDay);
    localStorage.setItem('vani_simulated_journey_day', newDay.toString());
  };

  const resetDay = () => {
    setJourneyDay(1);
    localStorage.setItem('vani_simulated_journey_day', '1');
  };

  return (
    <JourneyContext.Provider value={{ journeyDay, advanceDay, resetDay }}>
      {children}
      {/* Dev Tools Oculto/Flotante para Simular Avance */}
      <div style={{
        position: 'fixed', bottom: '10px', left: '10px', zIndex: 9999,
        background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', borderRadius: '8px',
        fontSize: '0.8rem', display: 'flex', gap: '10px', alignItems: 'center'
      }}>
        <span>Día de Viaje: {journeyDay}</span>
        <button onClick={advanceDay} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>+1 Día</button>
        <button onClick={resetDay} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Reset</button>
      </div>
    </JourneyContext.Provider>
  );
};
