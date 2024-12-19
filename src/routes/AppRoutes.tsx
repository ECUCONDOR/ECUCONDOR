import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
=======
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
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
      </Routes>
    </Router>
  );
};

export default AppRoutes;
