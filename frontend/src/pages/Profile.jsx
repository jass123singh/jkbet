import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Mail, Wallet, LogOut, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/payment/transactions');
        setTransactions(res.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <h1 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>My Profile</h1>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            <User color="var(--primary-color)" size={24} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Name</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{user.name}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            <Mail color="var(--primary-color)" size={24} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{user.email}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            <Wallet color="var(--primary-color)" size={24} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Balance</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{user.balance?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          
          <button 
            className="btn" 
            onClick={handleLogout} 
            style={{ 
              marginTop: '10px', 
              background: 'rgba(255, 59, 48, 0.2)', 
              color: '#ff3b30', 
              border: '1px solid rgba(255, 59, 48, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '20px' }}>
            <History color="var(--primary-color)" size={20} /> Transaction History
          </h2>
          
          <div className="glass-panel" style={{ padding: '15px', borderRadius: '16px' }}>
            {loading ? (
              <div className="flex-center" style={{ padding: '20px' }}>Loading...</div>
            ) : transactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transactions.map((tx, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {tx.type === 'deposit' ? <ArrowDownLeft color="var(--success)" size={20} /> : <ArrowUpRight color="var(--danger)" size={20} />}
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize' }}>{tx.type}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          Status: <span style={{ color: tx.status === 'success' ? 'var(--success)' : 'var(--text-muted)' }}>{tx.status}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                No transactions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
