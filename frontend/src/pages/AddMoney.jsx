import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddMoney = () => {
    const [amount, setAmount] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/manual-payment/create', 
                { amount, utrNumber }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("Payment request submitted successfully. It is pending approval.");
            setAmount('');
            setUtrNumber('');
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Add Money (Manual UPI)</h2>
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Payment Details</h3>
                <p><strong>UPI ID:</strong> payment@upi</p>
                <div style={{ margin: '15px 0' }}>
                    <p>Scan this QR code to pay:</p>
                    <div style={{ width: '150px', height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' }}>
                        <span>[QR Code Placeholder]</span>
                    </div>
                </div>
                <p>After payment, please enter your amount and UTR number below.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Amount:</label><br/>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label>UTR Number (12 digits):</label><br/>
                    <input 
                        type="text" 
                        value={utrNumber} 
                        onChange={(e) => setUtrNumber(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>

            {message && <p style={{ marginTop: '20px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
            
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px', padding: '10px' }}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default AddMoney;
