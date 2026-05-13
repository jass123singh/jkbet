import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminPayments = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/manual-payment/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setMessage("Failed to load requests.");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setMessage('');
            const token = localStorage.getItem('token');
            await api.put(`/manual-payment/${action}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Payment ${action}d successfully.`);
            fetchRequests();
        } catch (error) {
            setMessage(error.response?.data?.message || `Failed to ${action} payment.`);
        }
    };

    return (
        <div className="container" style={{ padding: '20px' }}>
            <h2>Admin: Manual Payment Requests</h2>
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>User</th>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Amount</th>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>UTR Number</th>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Status</th>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Date</th>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No payment requests found.</td>
                        </tr>
                    ) : (
                        requests.map(req => (
                            <tr key={req._id}>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                                    {req.userId?.name || 'Unknown'}<br/>
                                    <small>{req.userId?.email}</small>
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>₹{req.amount}</td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{req.utrNumber}</td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px',
                                        backgroundColor: req.status === 'approved' ? '#d4edda' : req.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                        color: req.status === 'approved' ? '#155724' : req.status === 'rejected' ? '#721c24' : '#856404'
                                    }}>
                                        {req.status}
                                    </span>
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{new Date(req.createdAt).toLocaleString()}</td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                                    {req.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleAction(req._id, 'approve')}
                                                style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req._id, 'reject')}
                                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px', padding: '10px' }}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default AdminPayments;
