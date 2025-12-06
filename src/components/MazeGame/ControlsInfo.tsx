import React from 'react';
import './styles.css';

export const ControlsInfo: React.FC = () => {
  return (
    <div className="controls-info">
      <h3>Controls</h3>
      <div className="controls-grid">
        <div className="control-item">
          <kbd>W</kbd>
          <span>Move Forward</span>
        </div>
        <div className="control-item">
          <kbd>S</kbd>
          <span>Move Backward</span>
        </div>
        <div className="control-item">
          <kbd>A</kbd>
          <span>Strafe Left / Rotate Left</span>
        </div>
        <div className="control-item">
          <kbd>D</kbd>
          <span>Strafe Right / Rotate Right</span>
        </div>
        <div className="control-item">
          <kbd>← →</kbd>
          <span>Rotate</span>
        </div>
      </div>
    </div>
  );
};