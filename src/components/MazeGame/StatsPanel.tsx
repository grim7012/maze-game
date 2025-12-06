import React from 'react';
import './styles.css';

interface StatsPanelProps {
  moves: number;
  status: string;
  isPaused: boolean;
  performanceMode: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  moves,
  status,
  isPaused,
  performanceMode
}) => {
  const efficiency = moves > 0 ? Math.round((1000 / moves) * 100) / 100 : 0;

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">MOVES</div>
          <div className="stat-value">{moves}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">STATUS</div>
          <div className={`stat-value status-${status}`}>
            {status.toUpperCase()}
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">EFFICIENCY</div>
          <div className="stat-value">{efficiency}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">MODE</div>
          <div className="stat-value">
            {performanceMode ? 'PERFORMANCE' : 'QUALITY'}
          </div>
        </div>
      </div>
      
      <div className="status-indicator">
        <div className={`indicator-dot ${isPaused ? 'paused' : 'playing'}`} />
        <span>{isPaused ? 'GAME PAUSED' : 'GAME ACTIVE'}</span>
      </div>
    </div>
  );
};