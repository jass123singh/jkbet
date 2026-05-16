import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, ArrowDownToLine, ArrowUpFromLine, Upload, Copy, Check, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Wallet = () => {
  const { user, updateBalance, refreshUser } = useContext(AuthContext);
  const [view, setView] = useState('main'); // 'main', 'deposit', 'withdraw'

  // Deposit state
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Withdraw state
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('6280696354@ptyes');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showMessage('UPI ID copied to clipboard!', 'success');
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showMessage('Please enter a valid amount', 'error');
      return;
    }

    if (Number(amount) < 200) {
      showMessage('Minimum deposit amount is ₹200', 'error');
      return;
    }

    if (!utr) {
      showMessage('Please enter the UTR number', 'error');
      return;
    }

    if (!screenshot) {
      showMessage('Please select a screenshot file', 'error');
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
      showMessage('Payment submitted. Waiting for admin approval.', 'success');
      setAmount('');
      setUtr('');
      setScreenshot(null);
      
      const fileInput = document.getElementById('screenshot-upload');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setView('main'), 2000);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to submit deposit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) < 500) {
      showMessage('Minimum withdrawal amount is ₹500', 'error');
      return;
    }

    if (!accountHolderName || !accountNumber || !ifscCode) {
      showMessage('All bank details are required', 'error');
      return;
    }
    
    if (Number(amount) > user.balance) {
      showMessage('Insufficient balance', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payment/withdraw', { 
        amount: Number(amount),
        accountHolderName,
        accountNumber,
        ifscCode
      });
      updateBalance(res.data.newBalance);
      setAmount('');
      setAccountHolderName('');
      setAccountNumber('');
      setIfscCode('');
      showMessage('Withdrawal request submitted successfully!', 'success');
      
      setTimeout(() => setView('main'), 2000);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Withdrawal failed', 'error');
    } finally {
      setLoading(false);
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
        
        {view === 'main' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>My Wallet</h1>
            </div>

            {/* Balance Card */}
            <div className="glass-panel" style={{ 
              padding: '30px 20px', 
              borderRadius: '24px', 
              background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '10px' }}>Current Balance</p>
              <h2 style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                ₹{user.balance?.toFixed(2) || '0.00'}
              </h2>
            </div>

            {/* Action Cards */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <div 
                onClick={() => { setView('deposit'); setAmount(''); }}
                style={{ 
                  flex: 1, 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '20px', 
                  borderRadius: '20px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease'
                }}
                className="hover-scale"
              >
                <div style={{ width: '50px', height: '50px', background: 'rgba(112, 0, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                  <ArrowDownToLine color="var(--primary-color)" size={24} />
                </div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Deposit Money</h3>
              </div>

              <div 
                onClick={() => { setView('withdraw'); setAmount(''); }}
                style={{ 
                  flex: 1, 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '20px', 
                  borderRadius: '20px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease'
                }}
                className="hover-scale"
              >
                <div style={{ width: '50px', height: '50px', background: 'rgba(0, 240, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                  <ArrowUpFromLine color="var(--primary-color)" size={24} />
                </div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Withdraw Money</h3>
              </div>
            </div>
          </div>
        )}

        {view === 'deposit' && (
          <div className="animate-fade-in glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={24} />
              </button>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', margin: 0 }}>
                <ArrowDownToLine color="var(--primary-color)" size={20} /> Deposit Money
              </h2>
            </div>

            <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(112, 0, 255, 0.1)', borderRadius: '16px', border: '1px solid rgba(112, 0, 255, 0.3)' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', textAlign: 'center', fontSize: '18px' }}>Scan & Pay</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                {/* QR Image updated per requirements */}
                <div style={{ background: 'white', padding: '10px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img 
                    src="/upi-qr.jpeg" 
                    alt="UPI QR" 
                    width="220"
                    style={{ 
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('qr-fallback').style.display = 'block';
                    }}
                  />
                  <div id="qr-fallback" style={{ display: 'none', color: '#ef4444', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
                    If QR does not load, use UPI ID: 6280696354@ptyes
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '5px' }}>UPI ID</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '16px', color: 'white' }}>
                      6280696354@ptyes
                    </span>
                    <button 
                      onClick={copyUpiId}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Copy UPI ID"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Amount (Min ₹200)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', padding: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>12-Digit UTR Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 312345678901"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', padding: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Payment Screenshot</label>
                <input 
                  id="screenshot-upload"
                  type="file" 
                  accept="image/*"
                  className="input-field" 
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  style={{ width: '100%', padding: '12px' }}
                />
              </div>

              <button 
                type="submit"
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : <><Upload size={20} /> Submit Deposit</>}
              </button>
            </form>
          </div>
        )}

        {view === 'withdraw' && (
          <div className="animate-fade-in glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={24} />
              </button>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', margin: 0 }}>
                <ArrowUpFromLine color="var(--primary-color)" size={20} /> Withdraw Money
              </h2>
            </div>

            <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.3)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '5px' }}>Available Balance</p>
              <h3 style={{ fontSize: '28px', color: 'var(--primary-color)', margin: 0 }}>₹{user.balance?.toFixed(2) || '0.00'}</h3>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Amount (Min ₹500)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', padding: '14px' }}
                />
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[500, 1000, 2000, 5000].map(val => (
                    <button 
                      key={val} 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ flex: '1 1 20%', padding: '8px 4px', fontSize: '12px', borderRadius: '8px' }}
                      onClick={() => setAmount(val.toString())}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Account Holder Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Full Name as per Bank"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', padding: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Bank Account Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', padding: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>IFSC Code</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', padding: '14px' }}
                />
              </div>

              <button 
                type="submit"
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 'bold' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </form>
          </div>
        )}

      </div>
    </>
  );
};

export default Wallet;
