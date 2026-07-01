import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { JourneyProvider } from './context/JourneyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import RotateSuggestion from './components/RotateSuggestion';
import CanvasDeJuego from './components/CanvasDeJuego';
import Landing from './pages/Landing';
import MundoVani from './pages/MundoVani';
import Ecoesfera from './pages/Ecoesfera';
import Personaje from './pages/Personaje';
import DashboardPadres from './pages/DashboardPadres';
import Capitulo from './pages/Capitulo';
import TestLectura from './pages/TestLectura';
import HubLectura from './pages/HubLectura';
import HubActividades from './pages/HubActividades';
import RegistroMultiPerfil from './pages/RegistroMultiPerfil';
import SeleccionPerfil from './pages/SeleccionPerfil';

// Helper component para proteger rutas
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!currentUser) return <Navigate to="/registro" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <JourneyProvider>
      <Router>
        <RotateSuggestion />
        <Routes>
          <Route path="/" element={<MundoVani />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/ecoesfera/:id" element={<Ecoesfera />} />
        <Route path="/personaje/:id" element={<Personaje />} />
          <Route path="/capitulo/:personajeId/:capituloId" element={<Capitulo />} />
          <Route path="/test-lectura/:personajeId/:capituloId" element={<TestLectura />} />
          <Route path="/hub-lectura" element={<HubLectura />} />
          <Route path="/hub-actividades" element={<HubActividades />} />
          <Route path="/juego/:personaje" element={<CanvasDeJuego />} />
          <Route path="/padres" element={<ProtectedRoute><DashboardPadres /></ProtectedRoute>} />
          
          {/* Nuevas rutas de Auth y Perfiles */}
          <Route path="/registro" element={<RegistroMultiPerfil />} />
          <Route path="/seleccionar-perfil" element={<ProtectedRoute><SeleccionPerfil /></ProtectedRoute>} />
        </Routes>
      </Router>
    </JourneyProvider>
    </AuthProvider>
  );
}

export default App;
