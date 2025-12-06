import React, { useRef, useEffect } from 'react';
import { GameState } from '../../types/game.types';
import './styles.css';

interface MinimapProps {
  gameState: GameState;
  size: number;
  cellSize: number;
}

export const Minimap: React.FC<MinimapProps> = ({ gameState, size, cellSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);

    // Calculate viewport boundaries
    const mazeWidth = gameState.maze[0].length;
    const mazeHeight = gameState.maze.length;
    const mapScale = size / Math.max(mazeWidth, mazeHeight) / cellSize;

    // Draw maze
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        const cell = gameState.maze[y][x];
        
        switch (cell.type) {
          case 'wall':
            ctx.fillStyle = '#333';
            break;
          case 'path':
            ctx.fillStyle = '#666';
            break;
          case 'start':
            ctx.fillStyle = '#4CAF50';
            break;
          case 'goal':
            ctx.fillStyle = '#FF5722';
            break;
          default:
            ctx.fillStyle = '#666';
        }

        ctx.fillRect(
          x * cellSize * mapScale,
          y * cellSize * mapScale,
          cellSize * mapScale,
          cellSize * mapScale
        );

        // Draw grid
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(
          x * cellSize * mapScale,
          y * cellSize * mapScale,
          cellSize * mapScale,
          cellSize * mapScale
        );
      }
    }

    // Draw player
    const playerX = gameState.player.position.x * cellSize * mapScale;
    const playerY = gameState.player.position.y * cellSize * mapScale;
    const playerSize = cellSize * mapScale * 0.5;

    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw player direction
    const directionLength = playerSize * 2;
    const directionX = playerX + Math.cos(gameState.player.rotation) * directionLength;
    const directionY = playerY + Math.sin(gameState.player.rotation) * directionLength;

    ctx.strokeStyle = '#FFEB3B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(directionX, directionY);
    ctx.stroke();

    // Draw goal
    const goalX = gameState.goalPosition.x * cellSize * mapScale;
    const goalY = gameState.goalPosition.y * cellSize * mapScale;
    
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(goalX, goalY, playerSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw FOV cone
    const fov = gameState.player.fieldOfView;
    const fovStart = gameState.player.rotation - fov / 2;
    const fovEnd = gameState.player.rotation + fov / 2;
    const fovRadius = cellSize * mapScale * 3;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.arc(playerX, playerY, fovRadius, fovStart, fovEnd);
    ctx.closePath();
    ctx.fill();
  }, [gameState, size, cellSize]);

  return (
    <div className="minimap-container">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="minimap-canvas"
      />
      <div className="minimap-info">
        <div>Moves: {gameState.moves}</div>
        <div>Status: {gameState.gameStatus}</div>
      </div>
    </div>
  );
};