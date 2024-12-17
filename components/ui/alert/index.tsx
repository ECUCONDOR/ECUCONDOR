import React from 'react';

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h2 className="font-bold mb-2">{children}</h2>;
};

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-sm">{children}</p>;
};

export const Alert: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="alert">{children}</div>;
};
