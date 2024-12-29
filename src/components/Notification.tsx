import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const showNotification = (type: NotificationProps['type'], title: string, message: string) => {
  // Implementar lógica para mostrar notificación
  console.log(`[${type}] ${title}: ${message}`);
};

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
  
  return (
    <div 
      className="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50"
      style={{ backgroundColor: bgColor, color: 'white' }}
    >
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="ml-2">✕</button>}
    </div>
  );
};

export default Notification;
