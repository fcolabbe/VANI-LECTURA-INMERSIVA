import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';

export default function DashboardPadres() {
  const navigate = useNavigate();
  const { tutorData, perfilesNinos, activeProfile, selectProfile } = useAuth();
  
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const reportRef = useRef();

  // Escuchar cambios en los diagnósticos del NIÑO SELECCIONADO
  useEffect(() => {
    if (!db || !activeProfile) {
      setDiagnosticos([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Asumimos que los diagnósticos se guardarán con perfilId
    const q = query(
      collection(db, "diagnosticos_padres"), 
      where("perfilId", "==", activeProfile.id)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar localmente por si falta el index compuesto en firebase
      docs.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
      setDiagnosticos(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando diagnósticos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeProfile]);

  const handleExportPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin:       10,
      filename:     `Reporte_VANI_${activeProfile?.nombre || 'General'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fade-in" style={{ 
      backgroundColor: '#f7f3eb', 
      minHeight: '100vh', 
      color: '#4a4a4a', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {/* Header Corporativo */}
      <header style={{ 
        padding: '20px 40px', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)', 
        backgroundColor: '#ffffff',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#78350f' }}>VANI: Panel Parental</h1>
          <div style={{ background: '#fef3c7', padding: '5px 15px', borderRadius: '20px', color: '#b45309', fontWeight: 'bold' }}>
            Tutor: {tutorData?.nombreTutor}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/seleccionar-perfil')}
            style={{
              background: 'transparent', border: '1px solid #0284c7', color: '#0284c7',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
            Cambiar Perfil (Netflix)
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
            }}>
            Cerrar Dashboard
          </button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Selector de Perfil Rápido */}
        <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#334155' }}>Viendo estadísticas de:</span>
          <select 
            value={activeProfile?.id || ''} 
            onChange={(e) => {
              const p = perfilesNinos.find(x => x.id === e.target.value);
              if(p) selectProfile(p);
            }}
            style={{ padding: '10px', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
          >
            <option value="" disabled>Selecciona un niño...</option>
            {perfilesNinos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.nivelEducacional})</option>
            ))}
          </select>
          
          {activeProfile && (
            <button onClick={handleExportPDF} style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              📄 Descargar Informe PDF
            </button>
          )}
        </div>

        {!activeProfile ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '24px' }}>
            <h2>Selecciona un perfil de la lista arriba para ver sus estadísticas.</h2>
          </div>
        ) : (
          <div ref={reportRef} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            
            {/* Sección Analítica */}
            <section>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#78350f', fontWeight: 'bold' }}>Progreso de {activeProfile.nombre}</h2>
              
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '25px', marginBottom: '20px', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>Precisión Fonológica General</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0d9488', lineHeight: '1' }}>85%</span>
                  <span style={{ color: '#64748b', paddingBottom: '5px', fontSize: '0.95rem' }}>+5% esta semana</span>
                </div>
              </div>

              {/* Gaps / Brechas Inteligentes */}
              <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '0 16px 16px 0', padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>💡 Sugerencia del Sistema VANI</h3>
                <p style={{ margin: 0, color: '#1e3a8a', lineHeight: '1.5' }}>
                  Hemos detectado una tasa alta de clics fallidos en Laberintos. Sugerimos descargar y jugar las actividades impresas de "Motricidad Fina" o usar el paquete extra de "Trazos Guiados".
                </p>
              </div>

              {/* Diagnósticos de Lectura Inteligentes */}
              <h2 style={{ fontSize: '1.3rem', margin: '30px 0 20px 0', color: '#78350f', fontWeight: 'bold' }}>Historial Clínico de Lectura</h2>
              
              {loading ? (
                <div style={{ padding: '20px', color: '#64748b' }}>Cargando informes...</div>
              ) : diagnosticos.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Aún no se han registrado tests de lectura para {activeProfile.nombre}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {diagnosticos.map((diag) => (
                    <div key={diag.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '25px', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#78350f' }}>Reporte de Lectura</span>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{diag.fecha}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#fef3c7', padding: '10px 15px', borderRadius: '12px', textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '0.8rem', color: '#78350f', fontWeight: 'bold' }}>WPM</div>
                          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#d97706' }}>{diag.wpm}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#4a4a4a', fontSize: '1rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {diag.diagnostico}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Panel de Suscripción */}
            <section data-html2canvas-ignore="true"> {/* Ignoramos esto en el PDF */}
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#78350f', fontWeight: 'bold' }}>Estado de la Cuenta</h2>
              
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#475569' }}>Plan Actual</h3>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: tutorData?.tipoPago === 'freemium' ? '#64748b' : '#0ea5e9' }}>
                    {tutorData?.tipoPago === 'freemium' ? 'Freemium (Cap. 0)' : 'Premium (Temporada Completa)'}
                  </div>
                </div>
                
                {tutorData?.tipoPago === 'freemium' && (
                  <button style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                    🌟 Desbloquear Temporada Completa
                  </button>
                )}
              </div>

              <h2 style={{ fontSize: '1.3rem', margin: '30px 0 20px 0', color: '#78350f', fontWeight: 'bold' }}>Paquetes de Entrenamiento</h2>
              
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🧩</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#1e293b' }}>Pack Refuerzo "Trazos Fino"</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>10 laberintos terapéuticos.</p>
                <button style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Comprar ($2.990 CLP)
                </button>
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
