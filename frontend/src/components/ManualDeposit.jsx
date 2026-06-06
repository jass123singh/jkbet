import React, { useState } from 'react';
import api from '../services/api';

const ManualDeposit = () => {
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!amount || !utr || !screenshot) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/transactions/manual-deposit`, {
        amount,
        utr,
        screenshot
      });

      setMessage(response.data.message);
      setAmount('');
      setUtr('');
      setScreenshot('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>
          Instruction: Pay using any UPI app, then enter UTR and screenshot URL.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'bold' }}>UPI ID:</span>
          <span style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', userSelect: 'all' }}>yourupi@upi</span>
        </div>
      </div>

      {message && <div style={{ background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #2ecc71' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(255, 23, 68, 0.2)', color: '#ff8a80', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ff8a80' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder="Amount (Min ₹100)"
            min="1"
            style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="input-field"
            placeholder="12 digit UTR number"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={screenshot}
            onChange={(e) => setScreenshot(e.target.value)}
            className="input-field"
            placeholder="Screenshot URL"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', borderRadius: '16px' }}
        >
          {loading ? 'Submitting...' : 'Submit Payment'}
        </button>
      </form>
    </div>
  );
};

export default ManualDeposit;
