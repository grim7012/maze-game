import React, { useState, useEffect, useCallback } from 'react';
import { GameEngine } from '../../core/game/GameEngine';
import { FirstPersonView } from './FirstPersonView';
import { Minimap } from './Minimap';
import { ControlsInfo } from './ControlsInfo';
import { Button } from '../common/Button';
import { SettingsPanel } from './SettingsPanel';
import { StatsPanel } from './StatsPanel';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameLoop } from '../../hooks/useGameLoop';
import './styles.css';

export const MazeGame: React.FC = () => {
  const [gameEngine] = useState(() => new GameEngine({
    mazeWidth: 14,
    mazeHeight: 14,
    playerSpeed: 0.045,
    smoothFactor: 0.2
  }));
  
  const [gameState, setGameState] = useState(() => gameEngine.getState());
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>('high');
  
  const controls = useKeyboardControls();

  const updateGame = useCallback((deltaTime: number) => {
    if (isPaused || gameState.gameStatus === 'won') return;

    // Handle movement
    if (controls.forward) {
      gameEngine.movePlayer(true, false);
    } else if (controls.backward) {
      gameEngine.movePlayer(false, false);
    }

    // Handle strafing
    if (controls.left) {
      gameEngine.movePlayer(false, true, -1);
    } else if (controls.right) {
      gameEngine.movePlayer(false, true, 1);
    }

    // Handle rotation
    if (controls.rotateLeft) {
      gameEngine.rotatePlayer(-1);
    } else if (controls.rotateRight) {
      gameEngine.rotatePlayer(1);
    }

    setGameState(gameEngine.getSmoothedState());
  }, [gameEngine, controls, isPaused, gameState.gameStatus]);

  useGameLoop(updateGame);

  useEffect(() => {
    if (gameState.gameStatus === 'won' && !showWinMessage) {
      setShowWinMessage(true);
      const timer = setTimeout(() => {
        setShowWinMessage(false);
        gameEngine.resetGame();
        setGameState(gameEngine.getState());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, showWinMessage, gameEngine]);

  const handleReset = () => {
    gameEngine.resetGame();
    setGameState(gameEngine.getState());
    setShowWinMessage(false);
  };

  const handleNewMaze = () => {
    gameEngine.resetGame();
    setGameState(gameEngine.getState());
    setShowWinMessage(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    setGraphicsQuality(quality);
    setPerformanceMode(quality === 'low');
  };

  return (
    <div className={`maze-game-container ${performanceMode ? 'performance-mode' : ''}`}>
      <div className="game-header">
        <div className="header-content">
          <h1 className="game-title">
            <span className="title-3d">3D</span>
            <span className="title-maze">MAZE</span>
            <span className="title-explorer">EXPLORER</span>
          </h1>
          <div className="game-subtitle">
            Navigate through the labyrinth and find the golden exit!
          </div>
        </div>
        
        <div className="header-controls">
          <Button
            variant="secondary"
            size="small"
            onClick={toggleSettings}
            className="settings-btn"
          >
            ⚙️ Settings
          </Button>
          <Button
            variant={isPaused ? "primary" : "secondary"}
            size="small"
            onClick={togglePause}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </Button>
        </div>
      </div>

      <div className="game-content">
        <div className="main-game-view">
          <div className="view-container">
            {isPaused && (
              <div className="pause-overlay">
                <div className="pause-text">GAME PAUSED</div>
                <div className="pause-instruction">Press P or click Resume to continue</div>
              </div>
            )}
            
            <FirstPersonView
              gameEngine={gameEngine}
              width={900}
              height={650}
              //quality={graphicsQuality}
              //showEffects={!performanceMode}
            />
            
            <div className="view-controls">
              <Button
                variant="danger"
                onClick={handleReset}
                className="control-btn reset-btn"
              >
                🔄 Reset Game
              </Button>
              <Button
                variant="primary"
                onClick={handleNewMaze}
                className="control-btn new-maze-btn"
              >
                🏗️ New Maze
              </Button>
            </div>
          </div>
          
          <div className="game-stats">
            <StatsPanel
              moves={gameState.moves}
              status={gameState.gameStatus}
              isPaused={isPaused}
              performanceMode={performanceMode}
            />
          </div>
        </div>

        <div className="game-sidebar">
          <div className="sidebar-section minimap-section">
            <div className="section-header">
              <h3>📡 Radar Map</h3>
              <div className="map-scale">Scale: 1:20</div>
            </div>
            <Minimap
              gameState={gameState}
              size={320}
              cellSize={24}
            //   showTrail={!performanceMode}
            //   showFog={true}
            />
          </div>
          
          <div className="sidebar-section controls-section">
            <ControlsInfo />
          </div>
          
          {showSettings && (
            <div className="sidebar-section settings-section">
              <SettingsPanel
                graphicsQuality={graphicsQuality}
                onQualityChange={handleQualityChange}
                performanceMode={performanceMode}
                onPerformanceModeChange={setPerformanceMode}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}
        </div>
      </div>

      {showWinMessage && (
        <div className="victory-overlay">
          <div className="victory-content">
            <div className="victory-icon">🏆</div>
            <h2 className="victory-title">MASTER NAVIGATOR!</h2>
            <div className="victory-stats">
              You completed the maze in <span className="highlight">{gameState.moves}</span> moves
            </div>
            <div className="victory-subtext">
              New maze generating in 3 seconds...
            </div>
          </div>
        </div>
      )}

      <div className="game-footer">
        <div className="footer-info">
          <div className="version-info">v1.0.0 | Built with React & TypeScript</div>
          <div className="hint-text">
            💡 Hint: Look for open pathways and use the radar map for navigation
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="keyboard-shortcuts">
        <div className="shortcut-hint">
          <kbd>P</kbd> Pause/Resume | <kbd>ESC</kbd> Menu | <kbd>F</kbd> Fullscreen
        </div>
      </div>
    </div>
  );
};