import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SeleccionPerfil() {
  const navigate = useNavigate();
  const { tutorData, perfilesNinos, selectProfile } = useAuth();

  const handleSelectProfile = (perfil) => {
    selectProfile(perfil);
    // Redirigir al inicio de la aventura
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      
      <h1 style={{ fontSize: '3rem', marginBottom: '10px', fontWeight: '300' }}>¿Quién va a jugar hoy?</h1>
      <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1.2rem' }}>
        Tutor: {tutorData?.nombreTutor || 'Cargando...'}
      </p>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
        {perfilesNinos.length === 0 ? (
          <div style={{ color: '#64748b' }}>No hay perfiles registrados.</div>
        ) : (
          perfilesNinos.map((perfil) => (
            <div 
              key={perfil.id}
              onClick={() => handleSelectProfile(perfil)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                width: '150px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.children[0].style.border = '4px solid white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.children[0].style.border = '4px solid transparent';
              }}
            >
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: getRandomColor(perfil.nombre),
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                border: '4px solid transparent',
                transition: 'border 0.2s',
                marginBottom: '15px'
              }}>
                {perfil.nombre.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '1.2rem', color: '#cbd5e1', textAlign: 'center' }}>{perfil.nombre}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>{perfil.nivelEducacional}</span>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => navigate('/padres')}
        style={{
          marginTop: '60px',
          padding: '10px 20px',
          background: 'transparent',
          border: '1px solid #475569',
          color: '#94a3b8',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#94a3b8'; }}
      >
        Administrar Perfiles (Dashboard Padres)
      </button>

    </div>
  );
}

// Helper para color de avatar aleatorio basado en el nombre
function getRandomColor(name) {
  const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
  let sum = 0;
  for(let i=0; i<name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}
