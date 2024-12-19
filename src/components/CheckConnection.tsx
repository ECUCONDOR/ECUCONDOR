import React, { useEffect, useState } from 'react';
import { authService } from '../lib/supabaseClient';

const CheckConnection: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError('Error al obtener el usuario: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {user ? (
        <div>Conexión exitosa. Usuario: {user.email}</div>
      ) : (
        <div>No hay usuario conectado.</div>
      )}
    </div>
  );
};

export default CheckConnection;
