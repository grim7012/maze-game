import { MazeCell, Vector2 } from '../../types/game.types';
import { Vec2 } from '../utils/Vector2';

export class MazeSolver {
  private maze: MazeCell[][];
  private visited: boolean[][];
  private path: Vector2[] = [];
  private start: Vector2;
  private goal: Vector2;

  constructor(maze: MazeCell[][]) {
    this.maze = maze;
    this.visited = Array(maze.length)
      .fill(null)
      .map(() => Array(maze[0].length).fill(false));
    
    this.start = this.findCell('start');
    this.goal = this.findCell('goal');
  }

  solve(): Vector2[] {
    this.path = [];
    this.visited = this.visited.map(row => row.fill(false));
    
    if (this.dfs(this.start.x, this.start.y)) {
      return this.path;
    }
    
    return [];
  }

  private dfs(x: number, y: number): boolean {
    // Check bounds
    if (!this.isValidCell(x, y)) return false;
    
    // Check if wall
    if (this.maze[y][x].type === 'wall') return false;
    
    // Check if visited
    if (this.visited[y][x]) return false;
    
    // Mark as visited
    this.visited[y][x] = true;
    this.path.push({ x, y });
    
    // Check if reached goal
    if (x === this.goal.x && y === this.goal.y) {
      return true;
    }
    
    // Try all directions
    const directions = [
      { dx: 1, dy: 0 },  // Right
      { dx: -1, dy: 0 }, // Left
      { dx: 0, dy: 1 },  // Down
      { dx: 0, dy: -1 }  // Up
    ];
    
    for (const dir of directions) {
      if (this.dfs(x + dir.dx, y + dir.dy)) {
        return true;
      }
    }
    
    // Backtrack
    this.path.pop();
    return false;
  }

  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.maze[0].length && y >= 0 && y < this.maze.length;
  }

  private findCell(type: 'start' | 'goal'): Vector2 {
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        if (this.maze[y][x].type === type) {
          return { x, y };
        }
      }
    }
    throw new Error(`${type} cell not found in maze`);
  }

  // Breadth-First Search alternative (finds shortest path)
  bfs(): Vector2[] {
    const queue: { x: number; y: number; path: Vector2[] }[] = [
      { x: this.start.x, y: this.start.y, path: [{ x: this.start.x, y: this.start.y }] }
    ];
    
    const visited = this.visited.map(row => row.fill(false));
    visited[this.start.y][this.start.x] = true;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Check if reached goal
      if (current.x === this.goal.x && current.y === this.goal.y) {
        return current.path;
      }
      
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ];
      
      for (const dir of directions) {
        const newX = current.x + dir.dx;
        const newY = current.y + dir.dy;
        
        if (
          this.isValidCell(newX, newY) &&
          this.maze[newY][newX].type !== 'wall' &&
          !visited[newY][newX]
        ) {
          visited[newY][newX] = true;
          queue.push({
            x: newX,
            y: newY,
            path: [...current.path, { x: newX, y: newY }]
          });
        }
      }
    }
    
    return [];
  }

  // A* algorithm for optimal pathfinding
  aStar(): Vector2[] {
    const startNode = { ...this.start, g: 0, h: 0, f: 0, parent: null };
    const goalNode = { ...this.goal, g: 0, h: 0, f: 0, parent: null };
    
    const openList: any[] = [startNode];
    const closedList: any[] = [];
    
    while (openList.length > 0) {
      // Get node with lowest f score
      let lowestIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIndex].f) {
          lowestIndex = i;
        }
      }
      
      const currentNode = openList[lowestIndex];
      
      // Found the goal
      if (currentNode.x === goalNode.x && currentNode.y === goalNode.y) {
        const path: Vector2[] = [];
        let current: any = currentNode;
        while (current) {
          path.unshift({ x: current.x, y: current.y });
          current = current.parent;
        }
        return path;
      }
      
      // Move current node to closed list
      openList.splice(lowestIndex, 1);
      closedList.push(currentNode);
      
      // Generate neighbors
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ];
      
      for (const dir of directions) {
        const neighborX = currentNode.x + dir.dx;
        const neighborY = currentNode.y + dir.dy;
        
        if (
          !this.isValidCell(neighborX, neighborY) ||
          this.maze[neighborY][neighborX].type === 'wall'
        ) {
          continue;
        }
        
        // Check if neighbor is in closed list
        if (closedList.some(node => node.x === neighborX && node.y === neighborY)) {
          continue;
        }
        
        const gScore = currentNode.g + 1;
        const hScore = this.heuristic(neighborX, neighborY, goalNode.x, goalNode.y);
        const fScore = gScore + hScore;
        
        // Check if neighbor is already in open list
        const openNode = openList.find(node => node.x === neighborX && node.y === neighborY);
        if (!openNode) {
          openList.push({
            x: neighborX,
            y: neighborY,
            g: gScore,
            h: hScore,
            f: fScore,
            parent: currentNode
          });
        } else if (gScore < openNode.g) {
          openNode.g = gScore;
          openNode.f = gScore + openNode.h;
          openNode.parent = currentNode;
        }
      }
    }
    
    return []; // No path found
  }
  
  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}