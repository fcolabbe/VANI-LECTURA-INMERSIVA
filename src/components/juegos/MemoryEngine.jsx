import React, { useState, useEffect, useRef } from 'react';

// Motor genérico de Asociación Abierta (Memoria sin fricción)
export default function MemoryEngine({ 
  nivel = 1, 
  onComplete 
}) {
  const containerRef = useRef(null);
  
  // Dificultad: Nivel 1 (3 pares), Nivel 2 (4 pares), Nivel 3 (6 pares)
  const getPairsData = (l) => {
    let numPairs = 3;
    if (l === 2) numPairs = 4;
    if (l >= 3) numPairs = 6;

    const allEmojis = ["🦋", "🐸", "🍎", "🍃", "🍄", "💧", "☀️", "🍁"];
    const selectedEmojis = allEmojis.slice(0, numPairs);
    
    // Duplicar para crear pares
    const cards = [];
    selectedEmojis.forEach((emoji, index) => {
      cards.push({ id: `a_${index}`, pairId: index, emoji, isMatched: false });
      cards.push({ id: `b_${index}`, pairId: index, emoji, isMatched: false });
    });
    
    // Desordenar
    return cards.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isDone, setIsDone] = useState(false);

  // Telemetry
  const metrics = useRef({
    startTime: 0,
    missClicks: 0
  });

  useEffect(() => {
    initEngine();
  }, [nivel]);

  const initEngine = () => {
    setCards(getPairsData(nivel));
    setSelectedCardId(null);
    setIsDone(false);
    metrics.current = { startTime: Date.now(), missClicks: 0 };
  };

  const handleCardClick = (card) => {
    if (card.isMatched || isDone) return;

    if (selectedCardId === null) {
      // Seleccionar la primera carta
      setSelectedCardId(card.id);
    } else {
      // Si hace clic en la misma carta, la deselecciona
      if (selectedCardId === card.id) {
        setSelectedCardId(null);
        return;
      }

      const firstCard = cards.find(c => c.id === selectedCardId);
      
      // Comprobar si son un par
      if (firstCard.pairId === card.pairId) {
        setCards(prev => {
          const newCards = prev.map(c => 
            (c.id === firstCard.id || c.id === card.id) ? { ...c, isMatched: true } : c
          );
          
          if (newCards.every(c => c.isMatched)) {
            handleFinishGame();
          }
          return newCards;
        });
      } else {
        // Fallo: solo sumamos missClick de forma silenciosa, no ocultamos nada
        metrics.current.missClicks += 1;
      }
      
      // Siempre resetear la selección después de un intento
      setSelectedCardId(null);
    }
  };

  const handleFinishGame = () => {
    setIsDone(true);
    const totalTime = (Date.now() - metrics.current.startTime) / 1000;
    if (onComplete) {
      onComplete({
        tiempoCompletadoSegundos: totalTime,
        intentosFallidos: metrics.current.missClicks,
        nivelAsignado: nivel
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%', height: '100%', 
        backgroundColor: '#f0f9ff', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div style={{
        position: 'absolute', top: 20, width: '100%', textAlign: 'center',
        zIndex: 10, color: '#0284c7', fontWeight: 'bold', fontSize: '1.2rem'
      }}>
        Encuentra las parejas (Están todas a la vista)
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${nivel >= 3 ? 4 : 3}, 1fr)`,
        gap: '20px',
        padding: '20px',
        maxWidth: '800px'
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            style={{
              width: '100px', height: '100px',
              backgroundColor: 'white',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '4rem', cursor: card.isMatched ? 'default' : 'pointer',
              boxShadow: selectedCardId === card.id ? '0 0 0 4px #38bdf8, 0 10px 25px rgba(56, 189, 248, 0.4)' : '0 4px 15px rgba(0,0,0,0.05)',
              transform: selectedCardId === card.id ? 'scale(1.05)' : (card.isMatched ? 'scale(0.8)' : 'scale(1)'),
              opacity: card.isMatched ? 0 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: card.isMatched ? 'none' : 'auto'
            }}
          >
            {card.emoji}
          </div>
        ))}
      </div>

      {isDone && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '2rem 3rem', borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out', zIndex: 200
        }}>
          <h2 style={{color: '#0284c7', margin: 0, fontSize: '2.5rem'}}>¡Excelente Memoria!</h2>
          <p style={{color: '#0369a1', fontSize: '1.2rem', marginTop: '0.5rem'}}>Asociaste todos los elementos.</p>
        </div>
      )}
    </div>
  );
}
