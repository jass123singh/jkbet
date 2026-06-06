import React, { useState } from 'react';
import api from '../services/api';
import Navbar from './Navbar';

const ManualDeposit = () => {
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!amount || !utr || !screenshot) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/transactions/manual-deposit`, {
        amount,
        utr,
        screenshot
      });

      setMessage(response.data.message);
      setAmount('');
      setUtr('');
      setScreenshot('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6 max-w-md mx-auto border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Add Coins (Manual UPI)</h2>
      
      <div className="bg-gray-700 p-4 rounded-md mb-6 border border-gray-600">
        <p className="text-gray-300 text-sm mb-2">Instruction: Pay using any UPI app, then enter UTR and screenshot URL.</p>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 font-semibold">UPI ID:</span>
          <span className="bg-gray-900 text-green-400 px-3 py-1 rounded select-all font-mono">yourupi@upi</span>
        </div>
      </div>

      {message && <div className="bg-green-600/20 border border-green-500 text-green-400 p-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-600/20 border border-red-500 text-red-400 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition"
            placeholder="Enter amount"
            min="1"
          />
        </div>
        
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">UTR / Reference No.</label>
          <input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition"
            placeholder="12 digit UTR number"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Screenshot URL</label>
          <input
            type="text"
            value={screenshot}
            onChange={(e) => setScreenshot(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition"
            placeholder="https://example.com/screenshot.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded transition duration-200 shadow-md shadow-green-900/50 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default ManualDeposit;
