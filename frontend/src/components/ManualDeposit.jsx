import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Upload } from 'lucide-react';
import api from '../services/api';

const ManualDeposit = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
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
      setErrorMsg('Please select a screenshot file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('utr', utr);
      formData.append('screenshot', screenshot);

      await api.post('/transactions/manual-deposit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMsg('Payment submitted. Waiting for admin approval.');
      setAmount('');
      setUtr('');
      setScreenshot(null);
      
      // Reset file input value
      const fileInput = document.getElementById('screenshot-upload');
      if (fileInput) fileInput.value = '';
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
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', textAlign: 'center' }}>Payment Instructions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <p style={{ fontSize: '14px', textAlign: 'center' }}>1. Scan the QR code or pay to the UPI ID below:</p>
          
          <img 
            src="/upi-qr.jpeg" 
            alt="UPI QR Code" 
            style={{ width: '150px', height: '150px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px', fontSize: '16px', color: 'var(--primary-color)' }}>
            6280696354@ptyes
          </div>
        </div>
        
        <p style={{ fontSize: '14px', textAlign: 'center' }}>2. Enter the amount paid, UTR number, and upload payment screenshot.</p>
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
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Payment Screenshot</label>
          <input 
            id="screenshot-upload"
            type="file" 
            accept="image/*"
            className="input-field" 
            onChange={(e) => setScreenshot(e.target.files[0])}
            style={{ width: '100%', padding: '10px' }}
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
