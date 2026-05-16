import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { History, Trophy, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    // Refresh user balance on dashboard load
    if (refreshUser) {
      refreshUser();
    }
    
    // Fetch bet history on mount
    const fetchHistory = async () => {
      try {
        const res = await api.get('/bet/history');
        setBetHistory(res.data || []);
      } catch (error) {
        console.error("Failed to fetch bet history", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const handleBetPlaced = (betResult) => {
    // Add new bet to top of history
    setBetHistory(prev => [betResult.bet, ...prev]);
    
    // Show toast for win/loss
    if (betResult.win) {
      showMessage(`🎉 YOU WON ₹${betResult.payout}! (Numbers matched: ${betResult.drawResult})`, 'success');
    } else {
      showMessage(`Draw Result: ${betResult.drawResult}. Better luck next time!`, 'error');
    }
  };

  return (
    <>
      <Navbar />
      {message && (
        <div className={`toast-message ${messageType}`}>
          {message}
        </div>
      )}
      <div className="container page-content">
        
        {/* Welcome Section */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
            Hello, <span className="text-gradient">{user.name?.split(' ')[0]}</span>! 🎮
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Ready to win today?</p>
        </div>

        {/* Stack everything vertically for mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          <section id="games-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '20px' }}>
              <Trophy color="var(--primary-color)" size={20} /> Featured Games
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <GameCard 
                title="Number Predictor" 
                imageColor="rgba(112, 0, 255, 0.4)" 
                description="Predict numbers and win 9x!"
                onPlay={() => navigate('/game/number-predictor')}
              />
              <GameCard 
                title="Plinko" 
                imageColor="rgba(250, 204, 21, 0.4)" 
                description="Drop the ball and win big multipliers!"
                onPlay={() => navigate('/game/plinko')}
              />
              <GameCard 
                title="Mines" 
                imageColor="rgba(0, 240, 255, 0.4)" 
                description="Avoid the mines and cash out."
                onPlay={() => showMessage('Coming Soon!', 'success')}
              />
            </div>
          </section>

          <section id="history-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '20px' }}>
              <History color="var(--primary-color)" size={20} /> Recent Bets
            </h2>
            
            <div className="glass-panel" style={{ padding: '15px', borderRadius: '16px' }}>
              {loading ? (
                <div className="flex-center" style={{ padding: '20px' }}>Loading...</div>
              ) : betHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {betHistory.slice(0, 5).map((bet, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                      borderLeft: `4px solid ${bet.result === 'won' ? 'var(--success)' : 'var(--danger)'}`
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                          {bet.gameType === 'plinko' ? `Plinko (${bet.mode})` : bet.numbers?.join(', ')}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>₹{bet.amount}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: bet.result === 'won' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 'bold'
                      }}>
                        {bet.result === 'won' ? `+₹${bet.payout} (${bet.multiplier}x)` : 'LOST'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No bets placed yet.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
