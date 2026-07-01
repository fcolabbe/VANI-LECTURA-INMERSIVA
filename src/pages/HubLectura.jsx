import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HubLectura() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      height: '100dvh', backgroundColor: '#f7f3eb', padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', marginBottom: '1rem' }}>← Volver</button>
        <h1 style={{ color: '#334155', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Muro de Lectura</h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>Repite los tests de velocidad lectora para superar tu propio récord.</p>
      </div>
      
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Placeholder: Aquí iteraremos sobre los capítulos que el niño ya desbloqueó */}
        <div 
          onClick={() => navigate('/test-lectura/leo/0')}
          style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>⛰️</div>
          <div>
            <h2 style={{ color: '#1e293b', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>El Despertar de la Montaña</h2>
            <p style={{ color: '#64748b', margin: 0 }}>Cuento de Leo • ~130 Palabras</p>
          </div>
        </div>

      </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
