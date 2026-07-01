import React from 'react';
import { useNavigate } from 'react-router-dom';
import VaniGuide from '../components/VaniGuide';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div 
      className="fade-in" 
      onClick={() => navigate('/hall')}
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer'
      }}
    >
      <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '40px' }}>
         <VaniGuide state="animar" overrideStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' }} />
      </div>
      <h1 style={{ color: '#889e99', fontSize: '2rem', fontWeight: 400, opacity: 0.7, letterSpacing: '2px' }}>
        Toca para despertar
      </h1>
    </div>
  );
}
