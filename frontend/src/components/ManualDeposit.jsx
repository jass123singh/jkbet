import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Upload } from 'lucide-react';
import api from '../services/api';

const ManualDeposit = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    if (!utr) {
      setErrorMsg('Please enter the UTR number');
      return;
    }

    if (!screenshot) {
      setErrorMsg('Please provide a screenshot URL/text');
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions/manual-deposit', {
        amount: Number(amount),
        utr,
        screenshot
      });
      setSuccessMsg('Payment submitted. Waiting for admin approval.');
      setAmount('');
      setUtr('');
      setScreenshot('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to submit deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
          <CreditCard color="var(--primary-color)" size={20} /> Add Money
        </h2>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '10px', border: '1px solid var(--primary-color)' }}>
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Payment Instructions</h3>
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>1. Pay using any UPI app to the ID below:</p>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px' }}>
          yourupi@upi
        </div>
        <p style={{ fontSize: '14px' }}>2. Enter the amount paid, UTR number, and upload screenshot link.</p>
      </div>

      {successMsg && (
        <div style={{ padding: '10px', background: 'rgba(0, 255, 0, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '10px', background: 'rgba(255, 0, 0, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="animate-fade-in">
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Amount (₹)</label>
          <input 
            type="number" 
            className="input-field" 
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>UTR / Reference Number</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="12-digit UTR number"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Screenshot Link</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Image URL (e.g., Imgur link)"
            value={screenshot}
            onChange={(e) => setScreenshot(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <button 
          type="submit"
          className="btn btn-primary" 
          style={{ width: '100%', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          disabled={loading}
        >
          {loading ? 'Submitting...' : <><Upload size={18} /> Submit Deposit</>}
        </button>
      </form>
    </div>
  );
};

export default ManualDeposit;
