import ProtectedRoute from '../components/ProtectedRoute';
import PayPalButton from '../components/PayPalButton';
import CreateWallet from '../components/CreateWallet';
import WalletBalance from '../components/WalletBalance';
import Notifications from '../components/Notifications';
import UserProfileComponent from '../components/UserProfile';
import TransactionList from '../components/TransactionList';

const Dashboard = () => {
  const amount = "100.00"; // Monto a pagar

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl">Dashboard</h1>
        <UserProfileComponent />
        <PayPalButton amount={amount} />
        <CreateWallet />
        <WalletBalance />
        <TransactionList />
        <Notifications />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
