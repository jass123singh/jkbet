import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Check, X, Clock, RefreshCw } from 'lucide-react';
import api from '../services/api';

const AdminManualWithdrawsComponent = () => {
  const { refreshUser } = useContext(AuthContext);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchWithdraws = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/transactions/manual-withdraws');
      setWithdraws(res.data);
    } catch (err) {
      setError('Failed to fetch withdraws. Ensure you are an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdraws();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/transactions/manual-withdraw/approve/${id}`);
      fetchWithdraws();
      if (refreshUser) refreshUser();
      showMessage('Approval successful', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/transactions/manual-withdraw/reject/${id}`);
      fetchWithdraws();
      if (refreshUser) refreshUser();
      showMessage('Rejection successful', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {message && (
        <div className={`toast-message ${messageType}`}>
          {message}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
          <Clock color="var(--primary-color)" size={20} /> Pending Manual Withdraws
        </h2>
        <button 
          onClick={fetchWithdraws}
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

      {loading && withdraws.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading withdraws...</div>
      ) : withdraws.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No manual withdraw requests found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>User</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Account Name</th>
                <th style={{ padding: '10px' }}>Account Number</th>
                <th style={{ padding: '10px' }}>IFSC</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdraws.map((w) => (
                <tr key={w._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontSize: '14px' }}>
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px' }}>
                    {w.user?.name || w.userId}
                    <br />
                    <span style={{ fontSize: '12px', color: '#888' }}>{w.user?.email}</span>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ₹{w.amount}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px' }}>
                    {w.accountHolderName}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontFamily: 'monospace' }}>
                    {w.accountNumber}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontFamily: 'monospace' }}>
                    {w.ifscCode}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: w.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : w.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: w.status === 'pending' ? '#facc15' : w.status === 'success' ? '#4ade80' : '#f87171'
                    }}>
                      {w.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {w.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleApprove(w._id)}
                          disabled={actionLoading === w._id}
                          className="btn"
                          style={{ background: '#22c55e', color: 'white', padding: '6px', borderRadius: '6px' }}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleReject(w._id)}
                          disabled={actionLoading === w._id}
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

export default AdminManualWithdrawsComponent;
