import { useNavigate, useLocation } from 'react-router-dom';

// Menú de 3 Pilares compartido (Historias / Retos WPM / Actividades).
// Ocupa 80px + safe-area inferior: las páginas que lo usan deben reservar
// paddingBottom: calc(90px + env(safe-area-inset-bottom)).
const PILARES = [
  { ruta: '/', icono: '📖', label: 'Historias' },
  { ruta: '/hub-lectura', icono: '⏱️', label: 'Retos WPM' },
  { ruta: '/hub-actividades', icono: '🎮', label: 'Actividades' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%', minHeight: '80px',
      backgroundColor: 'white', borderTop: '1px solid #e2e8f0',
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {PILARES.map(pilar => {
        const activo = pathname === pilar.ruta;
        return (
          <div
            key={pilar.ruta}
            onClick={() => { if (!activo) navigate(pilar.ruta); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: activo ? '#0D9488' : '#94a3b8', cursor: activo ? 'default' : 'pointer',
              opacity: activo ? 1 : 0.8, flex: 1, minHeight: '80px', padding: '8px 4px'
            }}
          >
            <span style={{ fontSize: '1.8rem', marginBottom: '4px', filter: activo ? 'none' : 'grayscale(1)' }}>
              {pilar.icono}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: activo ? 'bold' : '500' }}>
              {pilar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
