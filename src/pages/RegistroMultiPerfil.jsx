import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function RegistroMultiPerfil() {
  const navigate = useNavigate();
  const { setPerfilesNinos } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Tutor
  const [tutor, setTutor] = useState({
    nombreTutor: '',
    email: '',
    password: '',
    relacion: 'Padre/Madre'
  });

  // Step 2: Niños
  const [ninos, setNinos] = useState([
    { nombre: '', genero: 'M', fechaNacimiento: '', nivelEducacional: 'Pre-kínder' }
  ]);

  const handleTutorChange = (e) => {
    setTutor({ ...tutor, [e.target.name]: e.target.value });
  };

  const handleNinoChange = (index, e) => {
    const updated = [...ninos];
    updated[index][e.target.name] = e.target.value;
    setNinos(updated);
  };

  const addNino = () => {
    setNinos([...ninos, { nombre: '', genero: 'M', fechaNacimiento: '', nivelEducacional: 'Pre-kínder' }]);
  };

  const removeNino = (index) => {
    if (ninos.length === 1) return;
    const updated = ninos.filter((_, i) => i !== index);
    setNinos(updated);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!tutor.nombreTutor || !tutor.email || tutor.password.length < 6) {
      setError('Por favor completa todos los campos. La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    // Validar niños
    for (let n of ninos) {
      if (!n.nombre || !n.fechaNacimiento) {
        setError('Por favor completa el nombre y fecha de nacimiento de todos los niños.');
        return;
      }
    }
    
    setLoading(true);
    setError('');

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, tutor.email, tutor.password);
      const user = userCredential.user;

      // 2. Guardar datos del Tutor en Firestore
      await setDoc(doc(db, 'tutores', user.uid), {
        tutorId: user.uid,
        nombreTutor: tutor.nombreTutor,
        email: tutor.email,
        relacion: tutor.relacion,
        suscripcionActiva: false, // Freemium por defecto
        tipoPago: 'freemium',
        fechaRegistro: new Date().toISOString()
      });

      // 3. Guardar perfiles de niños en Firestore
      const perfilesGuardados = [];
      const ninosRef = collection(db, 'perfiles_ninos');
      for (let n of ninos) {
        const docRef = await addDoc(ninosRef, {
          tutorId: user.uid,
          nombre: n.nombre,
          genero: n.genero,
          fechaNacimiento: n.fechaNacimiento,
          nivelEducacional: n.nivelEducacional
        });
        perfilesGuardados.push({ id: docRef.id, ...n, tutorId: user.uid });
      }

      // Actualizar contexto local para evitar recarga
      setPerfilesNinos(perfilesGuardados);

      // 4. Redirigir a Selección de Perfil
      navigate('/seleccionar-perfil');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src="/logo.png" 
            alt="VANI Logo" 
            style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
          />
          <h1 style={{ color: '#0f172a', margin: 0 }}>Únete a VANI</h1>
          <p style={{ color: '#64748b' }}>Paso {step} de 2</p>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleNextStep}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#334155', fontWeight: 'bold' }}>Tu Nombre (Tutor)</label>
              <input type="text" name="nombreTutor" value={tutor.nombreTutor} onChange={handleTutorChange} style={inputStyle} placeholder="Ej. Ana Pérez" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#334155', fontWeight: 'bold' }}>Relación con los niños</label>
              <select name="relacion" value={tutor.relacion} onChange={handleTutorChange} style={inputStyle}>
                <option>Padre/Madre</option>
                <option>Terapeuta / Psicopedagoga</option>
                <option>Profesor(a)</option>
                <option>Otro Familiar</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#334155', fontWeight: 'bold' }}>Correo Electrónico</label>
              <input type="email" name="email" value={tutor.email} onChange={handleTutorChange} style={inputStyle} placeholder="ana@ejemplo.com" />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#334155', fontWeight: 'bold' }}>Contraseña</label>
              <input type="password" name="password" value={tutor.password} onChange={handleTutorChange} style={inputStyle} placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" style={btnStyle}>Siguiente: Agregar Niños →</button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit}>
            {ninos.map((n, index) => (
              <div key={index} style={{ padding: '20px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '15px', position: 'relative' }}>
                {ninos.length > 1 && (
                  <button type="button" onClick={() => removeNino(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                )}
                
                <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.1rem' }}>Perfil Niño {index + 1}</h3>
                
                <div style={{ marginBottom: '10px' }}>
                  <input type="text" name="nombre" value={n.nombre} onChange={(e) => handleNinoChange(index, e)} style={inputStyle} placeholder="Nombre o Apodo" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <select name="genero" value={n.genero} onChange={(e) => handleNinoChange(index, e)} style={inputStyle}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="X">Otro</option>
                  </select>
                  <input type="date" name="fechaNacimiento" value={n.fechaNacimiento} onChange={(e) => handleNinoChange(index, e)} style={inputStyle} />
                </div>

                <select name="nivelEducacional" value={n.nivelEducacional} onChange={(e) => handleNinoChange(index, e)} style={inputStyle}>
                  <option>Pre-kínder</option>
                  <option>Kínder</option>
                  <option>1° Básico</option>
                  <option>2° Básico</option>
                  <option>Educación Especial</option>
                </select>
              </div>
            ))}
            
            <button type="button" onClick={addNino} style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px dashed #cbd5e1', color: '#64748b', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
              + Agregar otro niño
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setStep(1)} style={{ ...btnStyle, background: '#cbd5e1', color: '#334155', flex: 0.4 }}>← Volver</button>
              <button type="submit" disabled={loading} style={{ ...btnStyle, flex: 1 }}>{loading ? 'Creando cuenta...' : 'Crear Cuenta y Comenzar'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '1rem'
};

const btnStyle = {
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1.1rem'
};
