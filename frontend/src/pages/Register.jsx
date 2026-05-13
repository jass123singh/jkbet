import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container page-content flex-center" style={{ paddingBottom: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', padding: '40px 24px', borderRadius: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '8px' }}>JOIN JK BET</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Create an account to play.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            borderRadius: '12px', 
            background: 'rgba(255, 23, 68, 0.1)',
            border: '1px solid var(--danger)',
            color: '#ff8a80',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Full Name" 
              style={{ paddingLeft: '45px' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Email Address" 
              style={{ paddingLeft: '45px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div style={{ marginBottom: '30px', position: 'relative' }}>
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              style={{ paddingLeft: '45px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? 'CREATING...' : 'REGISTER'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Already have an account? <br/>
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
