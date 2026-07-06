
// Botón volver circular compartido: área táctil de 64px y despeje del notch (safe-area).
// Acepta overrides puntuales de estilo (fondo, color, zIndex) vía `style`.
export default function BackButton({ onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      aria-label="Volver"
      style={{
        position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '20px',
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.8)', border: 'none', color: '#64748b',
        fontSize: '1.2rem', cursor: 'pointer', zIndex: 1010,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style
      }}
    >
      ←
    </button>
  );
}
