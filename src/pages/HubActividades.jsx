import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LaberintoJuego from '../components/juegos/LaberintoJuego';
import BusquedaVisualJuego from '../components/juegos/BusquedaVisualJuego';
import RompecabezasEngine from '../components/juegos/RompecabezasEngine';
import DiferenciasEngine from '../components/juegos/DiferenciasEngine';
import SecuenciasEngine from '../components/juegos/SecuenciasEngine';
import SombrasEngine from '../components/juegos/SombrasEngine';
import MemoryEngine from '../components/juegos/MemoryEngine';
import RevealEngine from '../components/juegos/RevealEngine';
import ColorEngine from '../components/juegos/ColorEngine';

export default function HubActividades() {
  const navigate = useNavigate();
  const [activeProto, setActiveProto] = useState(null); 
  const [selectedNivel, setSelectedNivel] = useState(1);

  const handleComplete = (metricas) => {
    console.log("Prototipo Completado. Métricas silenciosas capturadas:", metricas);
    setTimeout(() => setActiveProto(null), 2500);
  };

  if (activeProto) {
    return (
      <div style={{ width: '100vw', height: '100dvh', position: 'relative' }}>
        <button 
          onClick={() => setActiveProto(null)}
          style={{ position: 'absolute', top: 20, right: 20, zIndex: 100, padding: '10px 20px', borderRadius: '15px', border: 'none', background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Prototipo
        </button>
        {activeProto === 'laberinto' && <LaberintoJuego nivel={selectedNivel} onComplete={handleComplete} />}
        {activeProto === 'busqueda' && <BusquedaVisualJuego nivel={selectedNivel} onComplete={handleComplete} />}
        {activeProto === 'rompecabezas' && <RompecabezasEngine nivel={selectedNivel} imageSrc="/personaje_cuento0.png" onComplete={handleComplete} />}
        {activeProto === 'diferencias' && <DiferenciasEngine nivel={selectedNivel} imageSrc="/personaje_cuento0.png" onComplete={handleComplete} />}
        {activeProto === 'secuencias' && <SecuenciasEngine nivel={selectedNivel} onComplete={handleComplete} />}
        {activeProto === 'sombras' && <SombrasEngine nivel={selectedNivel} onComplete={handleComplete} />}
        {activeProto === 'memory' && <MemoryEngine nivel={selectedNivel} onComplete={handleComplete} />}
        {activeProto === 'reveal' && <RevealEngine nivel={selectedNivel} imageSrc="/personaje_cuento0.png" onComplete={handleComplete} />}
        {activeProto === 'color' && <ColorEngine nivel={selectedNivel} imageSrc="/personaje_cuento0.png" onComplete={handleComplete} />}
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100dvh', backgroundColor: '#f7f3eb', padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', marginBottom: '1rem' }}>← Volver</button>
        <h1 style={{ color: '#334155', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Centro de Entrenamiento Vani</h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>Elige qué habilidad quieres practicar hoy.</p>
      </div>
      
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {/* Selector de Nivel de Dificultad para Prototipos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'white', borderRadius: '16px', width: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <span style={{ fontWeight: 'bold', color: '#475569' }}>Simular Dificultad:</span>
          <button onClick={() => setSelectedNivel(1)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: selectedNivel === 1 ? '#0D9488' : '#e2e8f0', color: selectedNivel === 1 ? 'white' : '#64748b', cursor: 'pointer' }}>Nivel 1 (Cap 1-5)</button>
          <button onClick={() => setSelectedNivel(2)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: selectedNivel === 2 ? '#0D9488' : '#e2e8f0', color: selectedNivel === 2 ? 'white' : '#64748b', cursor: 'pointer' }}>Nivel 2 (Cap 6-10)</button>
          <button onClick={() => setSelectedNivel(3)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: selectedNivel === 3 ? '#0D9488' : '#e2e8f0', color: selectedNivel === 3 ? 'white' : '#64748b', cursor: 'pointer' }}>Nivel 3 (Cap 11-14)</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Card 1: Puzzles Espaciales (Búsqueda Visual) */}
        <div onClick={() => setActiveProto('busqueda')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px dashed #0D9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👀</div>
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>PROTOTIPO</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Búsqueda Visual</h2>
          <p style={{ color: '#64748b' }}>Encuentra los objetos camuflados. Mide barrido visual y concentración.</p>
          <div style={{ marginTop: '1rem', color: '#38BDF8', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 2: Rompecabezas Engine */}
        <div onClick={() => setActiveProto('rompecabezas')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧩</div>
            <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Rompecabezas</h2>
          <p style={{ color: '#64748b' }}>Arma la imagen cortada del cuento. Mide arrastre espacial y percepción lógica.</p>
          <div style={{ marginTop: '1rem', color: '#8b5cf6', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 3: Busca Diferencias Engine */}
        <div onClick={() => setActiveProto('diferencias')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #ec4899' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <span style={{ background: '#fce7f3', color: '#db2777', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Busca Diferencias</h2>
          <p style={{ color: '#64748b' }}>Encuentra las variaciones entre dos imágenes. Mide percepción visual.</p>
          <div style={{ marginTop: '1rem', color: '#ec4899', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 4: Ordenar Secuencias Engine */}
        <div onClick={() => setActiveProto('secuencias')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
            <span style={{ background: '#f3e8ff', color: '#9333ea', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Ordenar Historia</h2>
          <p style={{ color: '#64748b' }}>Ordena cronológicamente los eventos. Mide comprensión temporal.</p>
          <div style={{ marginTop: '1rem', color: '#a855f7', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 5: Sombras Mágicas Engine */}
        <div onClick={() => setActiveProto('sombras')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <span style={{ background: '#ffedd5', color: '#ea580c', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Sombras Mágicas</h2>
          <p style={{ color: '#64748b' }}>Arrastra el objeto a su silueta. Mide discriminación de formas.</p>
          <div style={{ marginTop: '1rem', color: '#f97316', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 6: Asociación Abierta Engine */}
        <div onClick={() => setActiveProto('memory')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Asociación Abierta</h2>
          <p style={{ color: '#64748b' }}>Empareja conceptos a la vista sin fricción de memoria ciega.</p>
          <div style={{ marginTop: '1rem', color: '#0284c7', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 7: Descubrimiento Engine */}
        <div onClick={() => setActiveProto('reveal')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Limpiar y Descubrir</h2>
          <p style={{ color: '#64748b' }}>Raspa la pantalla (barrido visual continuo) para revelar la imagen oculta.</p>
          <div style={{ marginTop: '1rem', color: '#475569', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 8: Coloreado Mágico Engine */}
        <div onClick={() => setActiveProto('color')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #db2777' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <span style={{ background: '#fce7f3', color: '#db2777', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVO MOTOR</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Coloreado Mágico</h2>
          <p style={{ color: '#64748b' }}>Toca las zonas grises para expandir explosiones de color mágicas.</p>
          <div style={{ marginTop: '1rem', color: '#db2777', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 9: Trazo y Motricidad (Laberinto) */}
        <div onClick={() => setActiveProto('laberinto')} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', border: '2px dashed #0D9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>PROTOTIPO</span>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Laberinto de Trazo</h2>
          <p style={{ color: '#64748b' }}>Traza la línea. Mide lateralidad, consistencia del trazo y precisión.</p>
          <div style={{ marginTop: '1rem', color: '#0D9488', fontWeight: 'bold' }}>Probar →</div>
        </div>

        {/* Card 3: Quiz de Comprensión */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Preguntas Curiosas</h2>
          <p style={{ color: '#64748b' }}>Demuestra lo que aprendiste respondiendo preguntas sobre las historias.</p>
          <div style={{ marginTop: '1rem', color: '#D97706', fontWeight: 'bold' }}>Jugar →</div>
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
