import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Target, AlertCircle } from 'lucide-react';

const BettingSystem = ({ onBetPlaced }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const { user, updateBalance } = useContext(AuthContext);

  const toggleNumber = (num) => {
    // Clear drawn numbers when user starts a new selection
    if (drawnNumbers.length > 0) {
      setDrawnNumbers([]);
    }

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedNumbers.length < 3) {
        setSelectedNumbers([...selectedNumbers, num]);
      } else {
        showMessage('You can only select up to 3 numbers', 'error');
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePlaceBet = async () => {
    if (selectedNumbers.length === 0) {
      showMessage('Please select at least one number', 'error');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showMessage('Please enter a valid bet amount', 'error');
      return;
    }

    if (user.balance < Number(amount)) {
      showMessage('Insufficient balance', 'error');
      return;
    }

    setLoading(true);
    // Clear previous draw
    setDrawnNumbers([]);
    
    try {
     const token = localStorage.getItem("token");

      const res = await api.post(
        '/bet/place',
        {
          numbers: selectedNumbers,
          amount: Number(amount)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data && res.data.draw) {
        setDrawnNumbers(res.data.draw);
      }
      
      if (res.data.status === 'won') {
        showMessage(`You won ₹${res.data.payout}!`, 'success');
      } else {
        showMessage('Better luck next time!', 'error');
      }
      
      setSelectedNumbers([]);
      setAmount('');
      
      const newBalance = res.data.newBalance ?? (user.balance - Number(amount));
      updateBalance(newBalance);
      
      if (onBetPlaced) onBetPlaced(res.data);
      
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to place bet', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
      <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
        <Target color="var(--primary-color)" size={20} /> Place Bet
      </h2>

      {message && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '15px', 
          borderRadius: '12px', 
          background: message.type === 'error' ? 'rgba(255, 23, 68, 0.1)' : 'rgba(0, 230, 118, 0.1)',
          border: `1px solid ${message.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
          color: message.type === 'error' ? '#ff8a80' : '#b9f6ca',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <AlertCircle size={16} /> {message.text}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
        Select 1 to 3 numbers
      </div>

      {drawnNumbers.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '15px', 
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginRight: '8px' }}>Winning Numbers:</span>
          <span style={{ 
            color: 'var(--primary-color)', 
            fontSize: '20px', 
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            {drawnNumbers.join(' - ')}
          </span>
        </div>
      )}

      <div className="number-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isDrawn = drawnNumbers.includes(num);
          let extraStyle = {};
          
          if (isDrawn) {
            extraStyle = {
              boxShadow: '0 0 15px var(--primary-color)',
              border: '2px solid var(--primary-color)',
              background: 'rgba(0, 230, 118, 0.3)',
              color: 'var(--primary-color)'
            };
          }

          return (
            <div 
              key={num} 
              className={`number-btn flex-center ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleNumber(num)}
              style={extraStyle}
            >
              {num}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px' }}>
        <input 
          type="number" 
          className="input-field" 
          placeholder="Bet Amount (₹)" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="10"
          style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
        />
      </div>

      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Selected</span>
          <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '16px' }}>
            {selectedNumbers.length > 0 ? selectedNumbers.join(', ') : '-'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Multiplier</span>
          <span style={{ fontWeight: 'bold', color: 'var(--secondary-color)', fontSize: '16px' }}>
            {selectedNumbers.length === 1 ? '9x' : selectedNumbers.length === 2 ? '4.5x' : selectedNumbers.length === 3 ? '3x' : '0x'}
          </span>
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '20px', padding: '18px', fontSize: '18px', borderRadius: '16px' }}
        onClick={handlePlaceBet}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'PLACE BET'}
      </button>
    </div>
  );
};

export default BettingSystem;
