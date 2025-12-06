import React from 'react';
import { Button } from '../common/Button';
import './styles.css';

interface SettingsPanelProps {
  graphicsQuality: 'low' | 'medium' | 'high';
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  performanceMode: boolean;
  onPerformanceModeChange: (enabled: boolean) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  graphicsQuality,
  onQualityChange,
  performanceMode,
  onPerformanceModeChange,
  onClose
}) => {
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>⚙️ Game Settings</h3>
        <Button variant="secondary" size="small" onClick={onClose}>
          ✕
        </Button>
      </div>
      
      <div className="settings-content">
        <div className="setting-group">
          <h4>Graphics Quality</h4>
          <div className="quality-buttons">
            {(['low', 'medium', 'high'] as const).map(quality => (
              <Button
                key={quality}
                variant={graphicsQuality === quality ? 'primary' : 'secondary'}
                size="small"
                onClick={() => onQualityChange(quality)}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="setting-group">
          <div className="setting-toggle">
            <span>Performance Mode</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={performanceMode}
                onChange={(e) => onPerformanceModeChange(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <p className="setting-description">
            Reduces visual effects for better performance on low-end devices
          </p>
        </div>
        
        <div className="setting-group">
          <h4>Controls Sensitivity</h4>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="10"
              defaultValue="5"
              className="sensitivity-slider"
            />
            <div className="slider-labels">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};