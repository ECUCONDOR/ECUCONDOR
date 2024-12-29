import React from 'react';

interface BankInfoProps {
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountHolder: string;
}

const BankInfo: React.FC<BankInfoProps> = ({
  bankName,
  accountNumber,
  accountType,
  accountHolder,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Bancaria</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Banco:</label>
          <p className="text-gray-800">{bankName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Número de Cuenta:</label>
          <p className="text-gray-800">{accountNumber}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Tipo de Cuenta:</label>
          <p className="text-gray-800">{accountType}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Titular:</label>
          <p className="text-gray-800">{accountHolder}</p>
        </div>
      </div>
    </div>
  );
};

export default BankInfo;
