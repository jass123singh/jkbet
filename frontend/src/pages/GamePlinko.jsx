import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PlinkoGame from '../components/PlinkoGame';

const GamePlinko = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBetPlaced = (betResult) => {
    if (betResult.win) {
      showMessage(`🎉 YOU WON ₹${betResult.payout}! (${betResult.drawResult})`, 'success');
    } else {
      showMessage(`Landed on ${betResult.drawResult}. Better luck next time!`, 'error');
    }
  };

  return (
    <>
      <Navbar />
      {message && (
        <div className={`toast-message ${messageType}`}>
          {message}
        </div>
      )}
      <div className="container page-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <PlinkoGame onBetPlaced={handleBetPlaced} />
        </div>
      </div>
    </>
  );
};

export default GamePlinko;
