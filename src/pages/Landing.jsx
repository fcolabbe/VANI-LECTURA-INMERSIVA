import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VaniGuide from '../components/VaniGuide';

export default function Landing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', fechaNacimiento: '', curso: '', genero: '', emailPadre: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de registro:", formData);
    navigate('/', { state: { nombreJugador: formData.nombre } });
  };

  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <img 
          src="/logo.png" 
          alt="VANI Logo" 
          style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
        />
        <h1 style={{ fontSize: '2.5rem', color: '#687b77', marginBottom: '1rem', fontWeight: '300' }}>
          Bienvenido al Universo VANI
        </h1>
        <p style={{ color: '#889e99', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6' }}>
          Un ecosistema de aprendizaje inmersivo de "Bajo Estímulo". Ayudamos a tu pequeño a descubrir la magia de la lectura a su propio ritmo.
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '450px',
        position: 'relative'
      }}>
        {/* Vani asomándose */}
        <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '100px', height: '100px' }}>
          <VaniGuide state="idle" />
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#4a5b57', marginBottom: '2rem', textAlign: 'center' }}>
          Comenzar la Aventura
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Nombre del Explorador/a" 
            required
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
          />
          <input 
            type="date" 
            required
            onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', color: '#64748b' }}
            title="Fecha de Nacimiento"
          />
          <select 
            required
            onChange={(e) => setFormData({...formData, curso: e.target.value})}
            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', color: '#64748b', backgroundColor: 'white' }}
          >
            <option value="">Nivel Escolar Actual</option>
            <option value="pre-kinder">Pre-Kinder</option>
            <option value="kinder">Kinder</option>
            <option value="primero">1ro Básico</option>
            <option value="segundo">2do Básico</option>
            <option value="tercero">3ro Básico</option>
            <option value="cuarto">4to Básico</option>
            <option value="homeschooling">Homeschooling / Otro</option>
          </select>
          <select 
            required
            onChange={(e) => setFormData({...formData, genero: e.target.value})}
            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', color: '#64748b', backgroundColor: 'white' }}
          >
            <option value="">Género (Opcional)</option>
            <option value="niño">Niño</option>
            <option value="niña">Niña</option>
            <option value="otro">Prefiero no decirlo</option>
          </select>
          <input 
            type="email" 
            placeholder="Correo del Padre/Tutor" 
            required
            onChange={(e) => setFormData({...formData, emailPadre: e.target.value})}
            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
          />
          
          <button type="submit" style={{
            marginTop: '1rem',
            padding: '15px',
            backgroundColor: '#889e99',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}>
            Ingresar al Mundo VANI
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1.5rem' }}>
          Al ingresar, recibirás el informe diagnóstico gratuito.
        </p>
      </div>
    </div>
  );
}
