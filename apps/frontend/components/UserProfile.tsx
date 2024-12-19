import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  wallet?: string;
  createdAt: string;
}

const UserProfileComponent = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setProfile(res.data);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Error al obtener perfil');
      }
    };

    if (session?.accessToken) {
      fetchProfile();
    }
  }, [session]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4 p-4 bg-gray-200 rounded">
      <h2 className="text-xl font-bold">Perfil de Usuario</h2>
      <p><strong>ID:</strong> {profile.id}</p>
      <p><strong>Nombre:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      {profile.wallet && <p><strong>Wallet:</strong> {profile.wallet}</p>}
      <p><strong>Creado en:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default UserProfileComponent;
