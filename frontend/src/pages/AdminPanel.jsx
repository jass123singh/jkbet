import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeposits = async () => {
    try {
      const response = await api.get(`/api/transactions/manual-deposits`);
      setDeposits(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied. This page is restricted to the admin email sjasdaman1234@gmail.com.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch deposits');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action === 'approve' ? 'approve this deposit and ADD coins' : 'reject this deposit'}?`)) return;
    
    setActionLoading(true);
    try {
      await api.put(`/api/transactions/manual-deposit/${action}/${id}`, {});
      fetchDeposits(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} deposit`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Secure Admin Panel</h1>

        {error && <div className="bg-red-600/20 border border-red-500 text-red-400 p-4 rounded mb-6 font-semibold shadow-lg shadow-red-900/20">{error}</div>}

        {!error && loading ? (
          <div className="text-white text-center py-8">Loading secure data...</div>
        ) : !error && (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-x-auto border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Date</th>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Coins Requested</th>
                  <th className="px-6 py-4">UTR Reference</th>
                  <th className="px-6 py-4">Screenshot (SS)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-tr-lg">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 font-medium">No pending manual deposits</td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(deposit.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {deposit.userDetails ? (
                          <div>
                            <div className="font-semibold text-white">{deposit.userDetails.name}</div>
                            <div className="text-xs text-gray-400">{deposit.userDetails.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">User missing</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-400">
                        {deposit.amount}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm tracking-widest text-gray-400">
                        {deposit.utr}
                      </td>
                      <td className="px-6 py-4">
                        {deposit.screenshot ? (
                          <a href={deposit.screenshot} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 bg-blue-900/30 px-3 py-1 rounded transition">
                            <span className="text-sm font-semibold">Check SS</span>
                          </a>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                          deposit.status === 'success' ? 'bg-green-600/20 text-green-400 border border-green-500/30' :
                          deposit.status === 'rejected' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {deposit.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(deposit._id, 'approve')}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-green-900/50"
                            >
                              Allow & Add Coins
                            </button>
                            <button
                              onClick={() => handleAction(deposit._id, 'reject')}
                              disabled={actionLoading}
                              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-red-900/50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
