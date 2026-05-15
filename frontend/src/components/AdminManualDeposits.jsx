import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Check, X, Clock, RefreshCw } from 'lucide-react';
import api from '../services/api';

const AdminManualDeposits = () => {
  const { refreshUser, user } = useContext(AuthContext);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/transactions/manual-deposits');
      setDeposits(res.data);
    } catch (err) {
      setError('Failed to fetch deposits. Ensure you are an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/transactions/manual-deposit/approve/${id}`);
      fetchDeposits();
      if (refreshUser) refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/transactions/manual-deposit/reject/${id}`);
      fetchDeposits();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
          <Clock color="var(--primary-color)" size={20} /> Pending Manual Deposits
        </h2>
        <button 
          onClick={fetchDeposits}
          className="btn"
          style={{ background: 'transparent', color: 'var(--primary-color)', padding: '8px' }}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', background: 'rgba(255, 0, 0, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {loading && deposits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading deposits...</div>
      ) : deposits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No manual deposits found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>User</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>UTR</th>
                <th style={{ padding: '10px' }}>Screenshot</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((dep) => (
                <tr key={dep._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontSize: '14px' }}>
                    {new Date(dep.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px' }}>
                    {dep.user?.name || dep.userId}
                    <br />
                    <span style={{ fontSize: '12px', color: '#888' }}>{dep.user?.email}</span>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ₹{dep.amount}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontFamily: 'monospace' }}>
                    {dep.utr}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {dep.screenshot && (
                      <a href={dep.screenshot.startsWith('http') ? dep.screenshot : `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${dep.screenshot}`} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={dep.screenshot.startsWith('http') ? dep.screenshot : `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${dep.screenshot}`} 
                          alt="Screenshot" 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #444' }} 
                        />
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: dep.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : dep.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: dep.status === 'pending' ? '#facc15' : dep.status === 'success' ? '#4ade80' : '#f87171'
                    }}>
                      {dep.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {dep.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleApprove(dep._id)}
                          disabled={actionLoading === dep._id}
                          className="btn"
                          style={{ background: '#22c55e', color: 'white', padding: '6px', borderRadius: '6px' }}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleReject(dep._id)}
                          disabled={actionLoading === dep._id}
                          className="btn"
                          style={{ background: '#ef4444', color: 'white', padding: '6px', borderRadius: '6px' }}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminManualDeposits;
