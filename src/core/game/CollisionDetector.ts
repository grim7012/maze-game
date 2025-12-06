import { MazeCell, Vector2 } from '../../types/game.types';
import { Vec2 } from '../utils/Vector2';

export class CollisionDetector {
  private cellSize: number;
  private playerRadius: number;
  private collisionBuffer: number;

  constructor(cellSize: number = 1.2, playerRadius: number = 0.35) {
    this.cellSize = cellSize;
    this.playerRadius = playerRadius;
    this.collisionBuffer = 0.15; // Extra buffer for smooth movement
  }

  checkCollision(
    position: Vector2,
    direction: Vector2,
    maze: MazeCell[][]
  ): { collision: boolean; newPosition: Vector2 } {
    const proposedPos = new Vec2(position.x + direction.x, position.y + direction.y);
    
    // Check all nearby cells for collision
    const checkRadius = this.playerRadius + this.collisionBuffer;
    const minX = Math.floor(proposedPos.x - checkRadius);
    const maxX = Math.floor(proposedPos.x + checkRadius);
    const minY = Math.floor(proposedPos.y - checkRadius);
    const maxY = Math.floor(proposedPos.y + checkRadius);

    let hasCollision = false;
    let pushX = 0;
    let pushY = 0;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (this.isWall(x, y, maze)) {
          // Calculate distance from player to wall cell
          const cellCenter = new Vec2(x + 0.5, y + 0.5);
          const dx = proposedPos.x - cellCenter.x;
          const dy = proposedPos.y - cellCenter.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const requiredDistance = this.playerRadius + 0.5; // Half cell + radius

          if (distance < requiredDistance) {
            hasCollision = true;
            // Calculate push away from wall
            const overlap = requiredDistance - distance;
            if (distance > 0) {
              pushX += (dx / distance) * overlap * 0.1; // Gentle push
              pushY += (dy / distance) * overlap * 0.1;
            }
          }
        }
      }
    }

    if (hasCollision) {
      // Attempt to move player away from collisions
      const adjustedPos = new Vec2(
        proposedPos.x + pushX,
        proposedPos.y + pushY
      );
      
      // Re-check adjusted position
      const recheck = this.checkSinglePosition(adjustedPos, maze);
      if (recheck.collision) {
        // If still colliding, don't move
        return { collision: true, newPosition: new Vec2(position.x, position.y) };
      }
      
      return { collision: false, newPosition: adjustedPos };
    }

    // Keep player within bounds with buffer
    const mazeWidth = maze[0].length;
    const mazeHeight = maze.length;
    const clampedX = Math.max(
      this.playerRadius + this.collisionBuffer,
      Math.min(mazeWidth - (this.playerRadius + this.collisionBuffer), proposedPos.x)
    );
    const clampedY = Math.max(
      this.playerRadius + this.collisionBuffer,
      Math.min(mazeHeight - (this.playerRadius + this.collisionBuffer), proposedPos.y)
    );

    return {
      collision: false,
      newPosition: new Vec2(clampedX, clampedY)
    };
  }

  private checkSinglePosition(position: Vector2, maze: MazeCell[][]): { collision: boolean } {
    const checkRadius = this.playerRadius;
    const minX = Math.floor(position.x - checkRadius);
    const maxX = Math.floor(position.x + checkRadius);
    const minY = Math.floor(position.y - checkRadius);
    const maxY = Math.floor(position.y + checkRadius);


    for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    if (this.isWall(x, y, maze)) {
      const cellCenter = new Vec2(x + 0.5, y + 0.5);
      // Cast position to Vec2 to access distanceTo method
      const playerPos = position as Vec2;
      const distance = playerPos.distanceTo(cellCenter);
      if (distance < this.playerRadius + 0.5) {
        return { collision: true };
      }
    }
  }
}    return { collision: false };
  }

  private isWall(x: number, y: number, maze: MazeCell[][]): boolean {
    if (x < 0 || x >= maze[0].length || y < 0 || y >= maze.length) {
      return true;
    }
    return maze[y][x].type === 'wall';
  }

  canMoveTo(position: Vector2, maze: MazeCell[][]): boolean {
    return !this.checkSinglePosition(position, maze).collision;
  }
}