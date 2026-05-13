import React from 'react';
import { Play } from 'lucide-react';

const GameCard = ({ title, imageColor, description, onPlay }) => {
  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease' }} 
         onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
         onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ 
        height: '140px', 
        background: `linear-gradient(135deg, ${imageColor} 0%, rgba(0,0,0,0.8) 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <h3 style={{ fontSize: '24px', textShadow: '0 2px 10px rgba(0,0,0,0.5)', zIndex: 2 }}>{title}</h3>
        {/* Overlay subtle pattern */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.5 }}></div>
      </div>
      
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
          {description}
        </p>
        
        <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }} onClick={onPlay}>
          <Play size={16} /> Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard;
