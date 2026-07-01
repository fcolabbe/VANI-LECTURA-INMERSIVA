import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParentalGate from '../components/ParentalGate';

const biomas = [
  { id: 'leo', nombre: 'Montaña del Eco', color: '#c4d7d1' },
  { id: 'koda', nombre: 'Selva de Colores', color: '#d1e2c4' },
  { id: 'bibi', nombre: 'Cinturón Estelar', color: '#d7c4d1' },
  { id: 'nia', nombre: 'Arrecife de Cristal', color: '#c4cdd7' }
];

export default function HallDeLosMundos() {
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', backgroundImage: 'url(/hall_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <ParentalGate />
      
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#687b77', fontWeight: '500', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>El Hall de los Mundos</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '4rem', color: '#889e99' }}>Selecciona tu aventura</p>
      
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {biomas.map(bioma => (
          <button
            key={bioma.id}
            onClick={() => navigate(`/libro/${bioma.id}`)}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: '500',
              color: '#4a5b57',
              transition: 'all 0.5s ease',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {bioma.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
