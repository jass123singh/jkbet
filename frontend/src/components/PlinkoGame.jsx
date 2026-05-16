import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PlayCircle, IndianRupee } from 'lucide-react';

const multipliers = {
  easy:   [2, 1.5, 1.2, 1.1, 1, 0.8, 0.5, 0.8, 1, 1.1, 1.2, 1.5, 2],
  medium: [4, 2, 1.5, 1.2, 0.8, 0.4, 0.2, 0.4, 0.8, 1.2, 1.5, 2, 4],
  hard:   [10, 5, 2, 1.2, 0.5, 0.2, 0.2, 0.2, 0.5, 1.2, 2, 5, 10],
  expert: [29, 8, 3, 1, 0.2, 0.2, 0.2, 0.2, 0.2, 1, 3, 8, 29]
};

const getMultiplierColor = (multiplier) => {
  if (multiplier >= 10) return '#ef4444'; // Red
  if (multiplier >= 3) return '#f97316';  // Orange
  if (multiplier >= 2) return '#eab308';  // Yellow
  if (multiplier >= 1) return '#22c55e';  // Green
  return '#64748b'; // Gray for loss
};

const PlinkoGame = ({ onBetPlaced }) => {
  const { user, updateBalance } = useContext(AuthContext);
  const [mode, setMode] = useState('medium');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [ballPath, setBallPath] = useState(null);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Canvas configuration
  const rows = 12;
  const pinRadius = 4;
  const ballRadius = 8;
  const bucketHeight = 30;

  // Draw static board
  const drawBoard = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Pins
    const startY = 40;
    const rowSpacing = (height - startY - bucketHeight - 20) / rows;
    
    ctx.fillStyle = '#cbd5e1';
    
    for (let r = 0; r < rows; r++) {
      const pinsInRow = r + 3;
      const rowWidth = pinsInRow * 30;
      const startX = (width - rowWidth) / 2;
      
      for (let p = 0; p < pinsInRow; p++) {
        const x = startX + p * 30 + 15;
        const y = startY + r * rowSpacing;
        
        ctx.beginPath();
        ctx.arc(x, y, pinRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    }
    
    // Draw Buckets
    const numBuckets = 13;
    const bucketWidth = 30;
    const bucketsStartX = (width - (numBuckets * bucketWidth)) / 2;
    const bucketsY = height - bucketHeight - 10;
    
    const currentMultipliers = multipliers[mode];
    
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < numBuckets; i++) {
      const x = bucketsStartX + i * bucketWidth;
      const mult = currentMultipliers[i];
      const color = getMultiplierColor(mult);
      
      // Draw bucket background
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, bucketsY, bucketWidth - 4, bucketHeight);
      
      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${mult}x`, x + bucketWidth / 2, bucketsY + bucketHeight / 2);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Initial draw
    drawBoard(ctx, canvas.width, canvas.height);
  }, [mode]); // Redraw when mode changes to update bucket colors

  const playPlinko = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 10) {
      alert("Minimum bet is ₹10");
      return;
    }
    if (Number(amount) > user.balance) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bet/plinko', { amount: Number(amount), mode });
      
      const { path, winnings, newBalance, multiplier, status } = res.data;
      
      // Animate Ball
      animateBall(path, () => {
        updateBalance(newBalance);
        onBetPlaced({
          bet: res.data.bet,
          win: status === 'won',
          payout: winnings,
          drawResult: `${multiplier}x`,
          amount: Number(amount),
          multiplier
        });
        setLoading(false);
      });
      
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing bet');
      setLoading(false);
    }
  };

  const animateBall = (path, onComplete) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const startY = 40;
    const rowSpacing = (height - startY - bucketHeight - 20) / rows;
    
    let currentRow = 0;
    let currentXOffset = 0; // Tracks logical position (how many rights)
    let progress = 0; // 0 to 1 between rows
    
    const animate = () => {
      drawBoard(ctx, width, height);
      
      // Calculate current ball position
      const pinsInRow = currentRow + 3;
      const rowWidth = pinsInRow * 30;
      const startX = (width - rowWidth) / 2;
      
      // Logical X for the specific pin
      const pinX = startX + currentXOffset * 30 + 15 + (15); // Add 15 for initial center drop
      const pinY = startY + currentRow * rowSpacing;
      
      if (currentRow < rows) {
        // Moving to next row
        const nextGoesRight = path[currentRow] === 1;
        const targetX = pinX + (nextGoesRight ? 15 : -15);
        const targetY = startY + (currentRow + 1) * rowSpacing;
        
        // Arc interpolation
        const currentX = pinX + (targetX - pinX) * progress;
        // Add a little bounce arc
        const currentY = pinY + (targetY - pinY) * progress - Math.sin(progress * Math.PI) * 10;
        
        ctx.fillStyle = '#facc15'; // Yellow ball
        ctx.beginPath();
        ctx.arc(currentX, currentY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        progress += 0.05; // Animation speed
        if (progress >= 1) {
          progress = 0;
          currentRow++;
          if (nextGoesRight) currentXOffset++;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Drop into bucket
        const numBuckets = 13;
        const bucketWidth = 30;
        const bucketsStartX = (width - (numBuckets * bucketWidth)) / 2;
        const finalX = bucketsStartX + currentXOffset * bucketWidth + bucketWidth / 2;
        const finalY = height - bucketHeight / 2 - 10;
        
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(finalX, finalY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        
        onComplete();
      }
    };
    
    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--primary-color)' }}>Plinko</h2>
        
        {/* Canvas for Game */}
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '10px', marginBottom: '20px' }}>
          <canvas 
            ref={canvasRef} 
            width={450} 
            height={400} 
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Controls */}
        <div style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {['easy', 'medium', 'hard', 'expert'].map(m => (
              <button
                key={m}
                className="btn"
                onClick={() => setMode(m)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 5px',
                  background: mode === m ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                  color: mode === m ? '#000' : '#fff',
                  borderRadius: '10px',
                  textTransform: 'capitalize',
                  fontSize: '14px',
                  fontWeight: mode === m ? 'bold' : 'normal'
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <IndianRupee size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="input-field"
                style={{ width: '100%', paddingLeft: '35px', paddingRight: '15px', paddingBottom: '12px', paddingTop: '12px' }}
                placeholder="Bet Amount"
              />
            </div>
            
            <button
              onClick={playPlinko}
              disabled={loading}
              className="btn btn-primary hover-scale"
              style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}
            >
              <PlayCircle size={20} />
              {loading ? 'Dropping...' : 'Drop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
