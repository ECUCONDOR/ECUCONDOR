import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChristmasLanding from '../components/ChristmasLanding';
import Wallet from '../apps/frontend/pages/Wallet';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChristmasLanding />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </Router>
  );
};

export default App;
