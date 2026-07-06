import React, { createContext, useContext, useState, useEffect } from 'react';

const JourneyContext = createContext();

export const useJourney = () => useContext(JourneyContext);

export const JourneyProvider = ({ children }) => {
  const [journeyDay, setJourneyDay] = useState(1);
  const [devPanelOpen, setDevPanelOpen] = useState(false);

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
      {/* Dev Tools para simular avance: solo en desarrollo, colapsado para no tapar la UI */}
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed', top: 'calc(50% - 20px)', left: 0, zIndex: 9999,
          display: 'flex', gap: '8px', alignItems: 'center'
        }}>
          <button
            onClick={() => setDevPanelOpen(o => !o)}
            title="Herramientas de desarrollo"
            style={{
              background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
              borderRadius: '0 8px 8px 0', padding: '8px 6px', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            🛠️
          </button>
          {devPanelOpen && (
            <div style={{
              background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', borderRadius: '8px',
              fontSize: '0.8rem', display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              <span>Día de Viaje: {journeyDay}</span>
              <button onClick={advanceDay} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>+1 Día</button>
              <button onClick={resetDay} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Reset</button>
            </div>
          )}
        </div>
      )}
    </JourneyContext.Provider>
  );
};
