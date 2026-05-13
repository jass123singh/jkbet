import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import api from '../services/api';

const WalletSystem = () => {
  const { user, updateBalance } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 100) {
      alert('Minimum deposit amount is ₹100');
      return;
    }

    setLoading(true);
    
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // Create order
      const orderRes = await api.post('/payment/create-order', { amount: Number(amount) });
      const { order, key_id } = orderRes.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: "INR",
        name: "JK BET",
        description: "Wallet Deposit",
        order_id: order.id,
        handler: async function (response) {
          try {
            const depositRes = await api.post('/payment/deposit', { 
              amount: Number(amount),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            updateBalance(depositRes.data.newBalance);
            setAmount('');
            alert('Payment successful! Balance updated.');
          } catch (error) {
            alert(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: "9999999999"
        },
        theme: {
          color: "#d4af37"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert(error.response?.data?.message || 'Payment initiation failed');
    }
    
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 500) {
      alert('Minimum withdrawal amount is ₹500');
      return;
    }
    
    if (Number(amount) > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payment/withdraw', { amount: Number(amount) });
      updateBalance(res.data.newBalance);
      setAmount('');
      alert('Withdrawal request submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
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

      <div className="animate-fade-in">
        <input 
          type="number" 
          className="input-field" 
          placeholder={`Amount (Min ${activeTab === 'deposit' ? '₹100' : '₹500'})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
        />

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {[100, 500, 1000, 5000].map(val => (
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
          onClick={activeTab === 'deposit' ? handlePayment : handleWithdraw}
          disabled={loading}
        >
          {loading ? 'Processing...' : (activeTab === 'deposit' ? 'Pay with Razorpay' : 'Request Withdrawal')}
        </button>
      </div>
    </div>
  );
};

export default WalletSystem;
