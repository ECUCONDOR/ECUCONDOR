import React from 'react';
import MyIcon from '@/assets/logo.svg';

const FallingIcon = ({ left, duration, delay }) => {
  return (
    <div
      className="absolute"
      style={{
        left: left,
        top: '-20px',
        animation: `fall ${duration}s linear infinite`,
        animationDelay: `${delay}s`
      }}
    >
      <img src={MyIcon} alt="Icono Caído" style={{ width: '50px' }} />
    </div>
  );
};

export default FallingIcon;
