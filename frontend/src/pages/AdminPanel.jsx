import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Direct Deposit State
  const [directEmail, setDirectEmail] = useState('');
  const [directAmount, setDirectAmount] = useState('');
  const [directMessage, setDirectMessage] = useState('');

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchDeposits = async () => {
    try {
      const response = await api.get(`/api/transactions/manual-deposits`);
      setDeposits(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied. This page is restricted to the admin.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch deposits');
      }
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get(`/api/transactions/withdrawals`);
      setWithdrawals(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchDeposits(), fetchWithdrawals()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDepositAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action === 'approve' ? 'approve this deposit and ADD coins' : 'reject this deposit'}?`)) return;
    
    setActionLoading(true);
    try {
      await api.put(`/api/transactions/manual-deposit/${action}/${id}`, {});
      await fetchDeposits();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} deposit`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action === 'approve' ? 'approve this withdrawal (mark as paid)' : 'reject this withdrawal (refund coins)'}?`)) return;
    
    setActionLoading(true);
    try {
      await api.put(`/api/transactions/withdrawal/${action}/${id}`, {});
      await fetchWithdrawals();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} withdrawal`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectDeposit = async (e) => {
    e.preventDefault();
    setDirectMessage('');
    if (!directEmail || !directAmount) return;
    
    setActionLoading(true);
    try {
      const response = await api.post(`/api/transactions/admin-deposit`, {
        email: directEmail,
        amount: directAmount
      });
      setDirectMessage(response.data.message);
      setDirectEmail('');
      setDirectAmount('');
    } catch (err) {
      setDirectMessage(err.response?.data?.message || 'Failed to send coins');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">JK BET Admin Panel</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold">Logout</button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && <div className="bg-red-600/20 border border-red-500 text-red-400 p-4 rounded mb-6 font-semibold">{error}</div>}

        {!error && (
          <>
            <div className="flex space-x-4 mb-6">
              <button onClick={() => setActiveTab('deposits')} className={`px-4 py-2 rounded font-bold ${activeTab === 'deposits' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Pending Deposits</button>
              <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded font-bold ${activeTab === 'withdrawals' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Pending Withdrawals</button>
              <button onClick={() => setActiveTab('direct')} className={`px-4 py-2 rounded font-bold ${activeTab === 'direct' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Direct Deposit</button>
            </div>

            {loading ? (
              <div className="text-white text-center py-8">Loading data...</div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-xl overflow-x-auto border border-gray-700 p-4">
                
                {/* DEPOSITS TAB */}
                {activeTab === 'deposits' && (
                  <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">UTR</th>
                        <th className="px-6 py-4">SS</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {deposits.length === 0 ? (
                        <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No pending deposits</td></tr>
                      ) : deposits.map(d => (
                        <tr key={d._id}>
                          <td className="px-6 py-4 text-sm">{new Date(d.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">{d.userDetails?.email || 'N/A'}</td>
                          <td className="px-6 py-4 font-bold text-green-400">{d.amount}</td>
                          <td className="px-6 py-4 font-mono text-sm">{d.utr}</td>
                          <td className="px-6 py-4">
                            {d.screenshot && <a href={d.screenshot} target="_blank" rel="noreferrer" className="text-blue-400 underline">View</a>}
                          </td>
                          <td className="px-6 py-4">{d.status}</td>
                          <td className="px-6 py-4">
                            {d.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button onClick={() => handleDepositAction(d._id, 'approve')} disabled={actionLoading} className="bg-green-600 px-3 py-1 rounded text-white text-sm">Approve (Add)</button>
                                <button onClick={() => handleDepositAction(d._id, 'reject')} disabled={actionLoading} className="bg-red-600 px-3 py-1 rounded text-white text-sm">Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* WITHDRAWALS TAB */}
                {activeTab === 'withdrawals' && (
                  <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Amount Requested</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {withdrawals.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No pending withdrawals</td></tr>
                      ) : withdrawals.map(w => (
                        <tr key={w._id}>
                          <td className="px-6 py-4 text-sm">{new Date(w.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">{w.userDetails?.email || 'N/A'}</td>
                          <td className="px-6 py-4 font-bold text-yellow-400">{w.amount}</td>
                          <td className="px-6 py-4">{w.status}</td>
                          <td className="px-6 py-4">
                            {w.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button onClick={() => handleWithdrawAction(w._id, 'approve')} disabled={actionLoading} className="bg-green-600 px-3 py-1 rounded text-white text-sm">Approve (Paid)</button>
                                <button onClick={() => handleWithdrawAction(w._id, 'reject')} disabled={actionLoading} className="bg-red-600 px-3 py-1 rounded text-white text-sm">Reject (Refund)</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* DIRECT DEPOSIT TAB */}
                {activeTab === 'direct' && (
                  <div className="max-w-md mx-auto py-8">
                    <h2 className="text-xl font-bold text-white mb-4">Direct User Deposit</h2>
                    <p className="text-gray-400 mb-6 text-sm">Instantly add coins to a user's wallet without them submitting a request.</p>
                    
                    {directMessage && <div className="bg-blue-600/20 text-blue-400 p-3 rounded mb-4">{directMessage}</div>}
                    
                    <form onSubmit={handleDirectDeposit} className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">User Email</label>
                        <input type="email" value={directEmail} onChange={e => setDirectEmail(e.target.value)} className="w-full bg-gray-700 text-white rounded px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Amount</label>
                        <input type="number" value={directAmount} onChange={e => setDirectAmount(e.target.value)} className="w-full bg-gray-700 text-white rounded px-3 py-2" required />
                      </div>
                      <button type="submit" disabled={actionLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Send Coins</button>
                    </form>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
