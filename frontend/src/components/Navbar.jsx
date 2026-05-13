import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Wallet, LogOut, User, History } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Do not show bottom nav on auth pages
  if (!user) {
    return (
      <header className="top-header">
        <h1 className="text-gradient" style={{ fontSize: '24px', margin: 0 }}>♠ JK BET</h1>
        <div>
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', marginRight: '15px', fontSize: '14px', fontWeight: 'bold' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Register</Link>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Top Header */}
      <header className="top-header">
        <h1 className="text-gradient" style={{ fontSize: '24px', margin: 0 }}>♠ JK BET</h1>
        <div className="glass-panel" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '20px' }}>
          <Wallet size={14} color="var(--primary-color)" />
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>₹{user.balance?.toFixed(2) || '0.00'}</span>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div 
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <Home size={24} />
          <span>Home</span>
        </div>
        
        <div 
          className="nav-item"
          onClick={() => {
            // Scroll to wallet section on dashboard, or navigate to wallet page if it existed
            if (location.pathname !== '/dashboard') {
              navigate('/dashboard');
            }
            window.scrollTo({ top: document.getElementById('wallet-section')?.offsetTop - 80 || 0, behavior: 'smooth' });
          }}
        >
          <Wallet size={24} />
          <span>Wallet</span>
        </div>

        <div 
          className={`nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}
          onClick={() => navigate('/transactions')}
        >
          <History size={24} />
          <span>History</span>
        </div>

        <div 
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <User size={24} />
          <span>Profile</span>
        </div>

        <div className="nav-item" onClick={handleLogout}>
          <LogOut size={24} />
          <span>Logout</span>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
