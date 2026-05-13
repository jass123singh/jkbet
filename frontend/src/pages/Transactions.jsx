import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../services/api';

const Transactions = () => {
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

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <h1 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>Transactions</h1>
        
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
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Transactions;
