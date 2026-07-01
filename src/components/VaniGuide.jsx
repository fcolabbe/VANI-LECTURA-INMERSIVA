import React from 'react';

export default function VaniGuide({ state, overrideStyle = {}, floating = false }) {
  // state puede ser: 'idle', 'animar', 'exito'
  
  const getScale = () => {
    if (state === 'animar') return 'scale(1.2)';
    if (state === 'exito') return 'scale(1.5) translateY(-10px)';
    return 'scale(1)';
  };

  return (
    <>
      <style>{`
        @keyframes floatWander {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(20px, -15px); }
          50% { transform: translate(5px, 20px); }
          75% { transform: translate(-20px, 5px); }
          100% { transform: translate(0px, 0px); }
        }
        .vani-floating {
          animation: floatWander 6s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.9), 0 0 40px rgba(251, 191, 36, 0.6); }
          100% { box-shadow: 0 0 40px rgba(251, 191, 36, 1), 0 0 80px rgba(251, 191, 36, 0.9), 0 0 120px rgba(245, 158, 11, 0.6); }
        }
        .vani-glow-animar {
          animation: pulseGlow 0.8s infinite alternate ease-in-out;
        }
      `}</style>
      <div style={{
        position: 'absolute', top: '20px', right: '30px',
        zIndex: 1000, pointerEvents: 'none', ...overrideStyle
      }}>
        <div className={floating ? 'vani-floating' : ''}>
          <div 
            className={state === 'animar' ? 'vani-glow-animar' : ''}
            style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: state === 'animar' 
                ? '0 0 40px rgba(251, 191, 36, 1), 0 0 80px rgba(251, 191, 36, 0.9)' 
                : '0 0 20px rgba(251, 191, 36, 0.9), 0 0 40px rgba(251, 191, 36, 0.6)',
              transition: 'all 0.5s ease',
              transform: getScale(),
            }}
          />
        </div>
      </div>
    </>
  );
}
