import { MazeCell, CellType, Vector2 } from '../../types/game.types';

export class MazeGenerator {
  private maze: MazeCell[][];
  private width: number;
  private height: number;

  constructor(width: number = 10, height: number = 10) {
    this.width = width;
    this.height = height;
    this.maze = [];
  }

  generate(): MazeCell[][] {
    // Initialize maze with walls
    for (let y = 0; y < this.height; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.maze[y][x] = {
          type: 'wall',
          x,
          y
        };
      }
    }

    // Start carving paths from the center
    const startX = Math.floor(this.width / 2);
    const startY = Math.floor(this.height / 2);
    this.carvePassage(startX, startY);

    // Set start position
    this.maze[startY][startX].type = 'start';

    // Find furthest point for goal
    const goalPosition = this.findFurthestPoint(startX, startY);
    this.maze[goalPosition.y][goalPosition.x].type = 'goal';

    // Ensure all paths are connected
    this.ensureConnectivity();

    return this.maze;
  }

  private carvePassage(x: number, y: number): void {
    // Mark current cell as path
    if (this.isValidCell(x, y)) {
      this.maze[y][x].type = 'path';
    }

    // Define directions
    const directions = [
      [0, -2], // Up
      [2, 0],  // Right
      [0, 2],  // Down
      [-2, 0]  // Left
    ];

    // Shuffle directions
    this.shuffleArray(directions);

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isValidCell(newX, newY) && this.maze[newY][newX].type === 'wall') {
        // Carve through the wall between cells
        this.maze[y + dy / 2][x + dx / 2].type = 'path';
        this.carvePassage(newX, newY);
      }
    }
  }

  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private findFurthestPoint(startX: number, startY: number): Vector2 {
    const visited = new Set<string>();
    const queue: [number, number, number][] = [[startX, startY, 0]];
    let maxDist = 0;
    let furthestPoint = { x: startX, y: startY };

    while (queue.length > 0) {
      const [x, y, dist] = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key) || this.maze[y][x].type === 'wall') continue;

      visited.add(key);

      if (dist > maxDist) {
        maxDist = dist;
        furthestPoint = { x, y };
      }

      // Add neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (this.isValidCell(nx, ny)) {
          queue.push([nx, ny, dist + 1]);
        }
      }
    }

    return furthestPoint;
  }

  private ensureConnectivity(): void {
    // Simple connectivity check - ensure all paths are reachable
    const visited = new Set<string>();
    const start = this.findStart();

    if (start) {
      this.floodFill(start.x, start.y, visited);
    }

    // Convert unreachable paths to walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`;
        if (!visited.has(key) && this.maze[y][x].type === 'path') {
          this.maze[y][x].type = 'wall';
        }
      }
    }
  }

  private floodFill(x: number, y: number, visited: Set<string>): void {
    const key = `${x},${y}`;
    if (!this.isValidCell(x, y) || visited.has(key) || this.maze[y][x].type === 'wall') {
      return;
    }

    visited.add(key);

    this.floodFill(x + 1, y, visited);
    this.floodFill(x - 1, y, visited);
    this.floodFill(x, y + 1, visited);
    this.floodFill(x, y - 1, visited);
  }

  private findStart(): Vector2 | null {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.maze[y][x].type === 'start') {
          return { x, y };
        }
      }
    }
    return null;
  }
}