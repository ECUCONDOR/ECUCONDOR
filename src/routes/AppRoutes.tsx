import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Home from '../pages/Home';
import ExchangeSystem from '../pages/ExchangeSystem';
import NegociacionesPage from '../pages/Negociaciones';
import Layout from '../components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas */}
        <Route
          path="/exchange"
          element={
            <PrivateRoute>
              <ExchangeSystem />
            </PrivateRoute>
          }
        />

        <Route
          path="/negociaciones"
          element={
            <PrivateRoute>
              <NegociacionesPage />
            </PrivateRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
