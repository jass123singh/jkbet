import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BettingSystem from '../components/BettingSystem';
import WalletSystem from '../components/WalletSystem';
import GameCard from '../components/GameCard';
import api from '../services/api';
import { History, Trophy, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    
    // Show alert for win/loss (simple implementation)
    if (betResult.win) {
      alert(`🎉 YOU WON ₹${betResult.payout}! (Numbers matched: ${betResult.drawResult})`);
    } else {
      alert(`Draw Result: ${betResult.drawResult}. Better luck next time!`);
    }
  };

  return (
    <>
      <Navbar />
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
          
          <section id="betting-section">
            <BettingSystem onBetPlaced={handleBetPlaced} />
          </section>

          <section id="wallet-section">
            <WalletSystem />
          </section>

          <section id="games-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '20px' }}>
              <Trophy color="var(--primary-color)" size={20} /> Featured Games
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <GameCard 
                title="Number Predictor" 
                imageColor="rgba(112, 0, 255, 0.4)" 
                description="Predict numbers and win 9x!"
                onPlay={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
              <GameCard 
                title="Mines" 
                imageColor="rgba(0, 240, 255, 0.4)" 
                description="Avoid the mines and cash out."
                onPlay={() => alert('Coming Soon!')}
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
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{bet.numbers?.join(', ')}</div>
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
