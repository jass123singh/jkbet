import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import api from '../services/api';
import ManualDeposit from './ManualDeposit';

const WalletSystem = () => {
  const { user, updateBalance } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const handleWithdraw = async () => {
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
    } catch (error) {
      showMessage(error.response?.data?.message || 'Withdrawal failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
      {message && (
        <div className={`toast-message ${messageType}`}>
          {message}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
          <CreditCard color="var(--primary-color)" size={20} /> Wallet
        </h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            ₹{user.balance?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '14px' }}>
        <button 
          className="btn" 
          style={{ flex: 1, padding: '12px', background: activeTab === 'deposit' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'deposit' ? 'black' : 'white', borderRadius: '10px' }}
          onClick={() => setActiveTab('deposit')}
        >
          <ArrowDownToLine size={16} /> Deposit
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, padding: '12px', background: activeTab === 'withdraw' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'withdraw' ? 'black' : 'white', borderRadius: '10px' }}
          onClick={() => setActiveTab('withdraw')}
        >
          <ArrowUpFromLine size={16} /> Withdraw
        </button>
      </div>

      {activeTab === 'deposit' ? (
        <ManualDeposit />
      ) : (
        <div className="animate-fade-in">
          <input 
            type="number" 
            className="input-field" 
            placeholder="Amount (Min ₹500)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}
          />

          <input 
            type="text" 
            className="input-field" 
            placeholder="Account Holder Name"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <input 
            type="text" 
            className="input-field" 
            placeholder="Bank Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <input 
            type="text" 
            className="input-field" 
            placeholder="IFSC Code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {[500, 1000, 2000, 5000].map(val => (
              <button 
                key={val} 
                className="btn btn-secondary" 
                style={{ flex: '1 1 20%', padding: '10px 4px', fontSize: '12px', borderRadius: '8px' }}
                onClick={() => setAmount(val.toString())}
              >
                +₹{val}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '20px', padding: '16px', borderRadius: '16px' }}
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletSystem;
