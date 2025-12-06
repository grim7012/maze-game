import { GameState, GameConfig, Player, MazeCell } from '../../types/game.types';
import { MazeGenerator } from '../maze/MazeGenerator';
import { CollisionDetector } from './CollisionDetector';
import { Vec2 } from '../utils/Vector2';
import { MathUtils } from '../utils/MathUtils';

export class GameEngine {
  private state: GameState;
  private mazeGenerator: MazeGenerator;
  private collisionDetector: CollisionDetector;
  private config: Required<GameConfig>; // Use Required to make all properties mandatory
  private smoothRotation: number = 0;
  private smoothMovement: Vec2 = new Vec2(0, 0);
  private movementHistory: Vec2[] = [];

  constructor(config: Partial<GameConfig> = {}) {
    // Provide default values for optional properties
    const defaultConfig: Required<GameConfig> = {
      mazeWidth: 12,
      mazeHeight: 12,
      cellSize: 1.2,
      playerSpeed: 0.04,
      rotationSpeed: 0.025,
      fov: MathUtils.degreesToRadians(75),
      maxRayDistance: 15,
      playerRadius: 0.35,
      wallThickness: 0.1,
      smoothFactor: 0.15,
    };

    this.config = {
      ...defaultConfig,
      ...config
    } as Required<GameConfig>;

    this.mazeGenerator = new MazeGenerator(this.config.mazeWidth, this.config.mazeHeight);
    this.collisionDetector = new CollisionDetector(this.config.cellSize, this.config.playerRadius);
    this.state = this.initializeGame();
    this.smoothMovement = new Vec2(this.state.player.position.x, this.state.player.position.y);
  }

  private initializeGame(): GameState {
    const maze = this.mazeGenerator.generate();
    const player = this.findStartPosition(maze);
    const goalPosition = this.findGoalPosition(maze);
    this.smoothRotation = player.rotation;
    this.smoothMovement = new Vec2(player.position.x, player.position.y);
    this.movementHistory = [new Vec2(player.position.x, player.position.y)];

    return {
      maze,
      player,
      goalPosition,
      gameStatus: 'playing',
      moves: 0,
      effects: {
        bobAmount: 0,
        bobSpeed: 0,
        swayAmount: 0,
        lastStepTime: 0
      }
    };
  }

  private findStartPosition(maze: MazeCell[][]): Player {
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x].type === 'start') {
          // Find open space around start
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const checkX = x + dx;
              const checkY = y + dy;
              if (this.isValidCell(checkX, checkY, maze) && maze[checkY][checkX].type === 'path') {
                const position = new Vec2(checkX + 0.5, checkY + 0.5);
                return {
                  position: position as any, // Cast to Vec2Type since Vec2 implements the interface
                  rotation: Math.PI / 4,
                  fieldOfView: this.config.fov
                };
              }
            }
          }
        }
      }
    }
    // Fallback to center with clearance check
    const centerX = Math.floor(this.config.mazeWidth / 2);
    const centerY = Math.floor(this.config.mazeHeight / 2);
    const position = new Vec2(centerX + 0.5, centerY + 0.5);
    return {
      position: position as any,
      rotation: Math.PI / 4,
      fieldOfView: this.config.fov
    };
  }

  private findGoalPosition(maze: MazeCell[][]): Vec2 {
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x].type === 'goal') {
          // Ensure goal has space around it
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const checkX = x + dx;
              const checkY = y + dy;
              if (this.isValidCell(checkX, checkY, maze) && maze[checkY][checkX].type === 'path') {
                return new Vec2(checkX + 0.5, checkY + 0.5);
              }
            }
          }
        }
      }
    }
    // Fallback to far corner with clearance
    return new Vec2(this.config.mazeWidth - 2.5, this.config.mazeHeight - 2.5);
  }

  private isValidCell(x: number, y: number, maze: MazeCell[][]): boolean {
    return x >= 0 && x < maze[0].length && y >= 0 && y < maze.length;
  }

  movePlayer(forward: boolean, strafe: boolean, strafeAmount: number = 0): void {
    if (this.state.gameStatus !== 'playing') return;

    const moveSpeed = this.config.playerSpeed;
    const moveDirection = new Vec2(
      Math.cos(this.state.player.rotation),
      Math.sin(this.state.player.rotation)
    );

    let moveVector = new Vec2(0, 0);

    if (forward) {
      moveVector = moveVector.add(moveDirection.multiply(moveSpeed));
      this.addMovementEffect(true);
    } else if (!forward) {
      moveVector = moveVector.subtract(moveDirection.multiply(moveSpeed * 0.7));
      this.addMovementEffect(false);
    }

    if (strafe) {
      const strafeDirection = moveDirection.rotate(Math.PI / 2);
      moveVector = moveVector.add(strafeDirection.multiply(moveSpeed * strafeAmount * 0.8));
      if (Math.abs(strafeAmount) > 0) this.addMovementEffect(false);
    }

    if (moveVector.x !== 0 || moveVector.y !== 0) {
      // Since we know player.position is Vec2 (from our creation), we can cast it
      const playerPos = this.state.player.position as unknown as Vec2;
      
      const result = this.collisionDetector.checkCollision(
        playerPos,
        moveVector,
        this.state.maze
      );

      if (!result.collision) {
        // Update player position
        this.state.player.position = result.newPosition as any;
        
        // Apply smoothing
        // this.smoothMovement = this.smoothMovement
        //   .multiply(1 - this.config.smoothFactor)
        //   .add(result.newPosition.multiply(this.config.smoothFactor));
        
        // // Add to movement history for trail effect
        // this.movementHistory.push(result.newPosition.clone());
        // if (this.movementHistory.length > 10) {
        //   this.movementHistory.shift();
        // }
        
        this.state.moves++;

        // Update movement effects
        this.updateMovementEffects();

        // Check if reached goal
        if (this.checkGoalReached()) {
          this.state.gameStatus = 'won';
        }
      } else {
        // Gentle collision response - slide along wall
        const slideVector = new Vec2(
          result.newPosition.x - playerPos.x,
          result.newPosition.y - playerPos.y
        ).multiply(0.3);
        
        const slideResult = this.collisionDetector.checkCollision(
          playerPos,
          slideVector,
          this.state.maze
        );
        
        if (!slideResult.collision) {
          this.state.player.position = slideResult.newPosition as any;
        }
      }
    } else {
      // Reset movement effects when not moving
      if (this.state.effects) {
        this.state.effects.bobSpeed = 0;
        this.state.effects.bobAmount *= 0.9;
      }
    }
  }

  rotatePlayer(direction: number): void {
    if (this.state.gameStatus !== 'playing') return;

    const rotationAmount = direction * this.config.rotationSpeed;
    this.state.player.rotation += rotationAmount;
    
    // Apply smoothing to rotation
    this.smoothRotation += (this.state.player.rotation - this.smoothRotation) * this.config.smoothFactor;
    
    // Normalize rotation to [0, 2π)
    this.state.player.rotation = this.state.player.rotation % (2 * Math.PI);
    this.smoothRotation = this.smoothRotation % (2 * Math.PI);
    
    if (this.state.player.rotation < 0) {
      this.state.player.rotation += 2 * Math.PI;
      this.smoothRotation += 2 * Math.PI;
    }
  }

  private addMovementEffect(isForward: boolean): void {
    if (!this.state.effects) return;
    
    const now = Date.now();
    if (now - this.state.effects.lastStepTime > 300) {
      this.state.effects.bobSpeed = isForward ? 0.03 : 0.02;
      this.state.effects.swayAmount = isForward ? 0.02 : 0.01;
      this.state.effects.lastStepTime = now;
    }
  }

  private updateMovementEffects(): void {
    if (!this.state.effects) return;
    
    // Bobbing effect
    this.state.effects.bobAmount += this.state.effects.bobSpeed;
    this.state.effects.bobSpeed *= 0.9;
    
    // Sway effect
    this.state.effects.swayAmount *= 0.9;
  }

  private checkGoalReached(): boolean {
    const playerPos = this.state.player.position;
    const goalPos = this.state.goalPosition;
    const dx = playerPos.x - goalPos.x;
    const dy = playerPos.y - goalPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 0.7;
  }

  getSmoothedState() {
    return {
      ...this.state,
      player: {
        ...this.state.player,
        rotation: this.smoothRotation,
        position: this.smoothMovement.clone() as any
      },
      movementHistory: [...this.movementHistory]
    };
  }

  resetGame(): void {
    this.state = this.initializeGame();
  }

  getState(): GameState {
    return { ...this.state };
  }

  getConfig(): GameConfig {
    return { ...this.config };
  }

  raycast(rayAngle: number): { distance: number; hitWall: boolean; hitType: string } {
    const playerPos = this.state.player.position as unknown as Vec2;
    const rayDirection = new Vec2(
      Math.cos(rayAngle),
      Math.sin(rayAngle)
    );

    const rayUnitStepSize = new Vec2(
      Math.sqrt(1 + (rayDirection.y / rayDirection.x) ** 2),
      Math.sqrt(1 + (rayDirection.x / rayDirection.y) ** 2)
    );

    let mapCheck = new Vec2(
      Math.floor(playerPos.x),
      Math.floor(playerPos.y)
    );

    let rayLength1D = new Vec2(0, 0);
    const step = new Vec2(0, 0);

    // Determine step direction and initial ray length
    if (rayDirection.x < 0) {
      step.x = -1;
      rayLength1D.x = (playerPos.x - mapCheck.x) * rayUnitStepSize.x;
    } else {
      step.x = 1;
      rayLength1D.x = (mapCheck.x + 1 - playerPos.x) * rayUnitStepSize.x;
    }

    if (rayDirection.y < 0) {
      step.y = -1;
      rayLength1D.y = (playerPos.y - mapCheck.y) * rayUnitStepSize.y;
    } else {
      step.y = 1;
      rayLength1D.y = (mapCheck.y + 1 - playerPos.y) * rayUnitStepSize.y;
    }

    let distance = 0;
    let maxDistance = this.config.maxRayDistance;
    let hitWall = false;
    let hitType = 'empty';

    while (!hitWall && distance < maxDistance) {
      // Walk towards next map boundary
      if (rayLength1D.x < rayLength1D.y) {
        mapCheck.x += step.x;
        distance = rayLength1D.x;
        rayLength1D.x += rayUnitStepSize.x;
        hitType = 'vertical';
      } else {
        mapCheck.y += step.y;
        distance = rayLength1D.y;
        rayLength1D.y += rayUnitStepSize.y;
        hitType = 'horizontal';
      }

      // Check if ray has hit a wall
      if (
        mapCheck.x >= 0 && mapCheck.x < this.config.mazeWidth &&
        mapCheck.y >= 0 && mapCheck.y < this.config.mazeHeight
      ) {
        const cell = this.state.maze[mapCheck.y][mapCheck.x];
        if (cell.type === 'wall') {
          hitWall = true;
          
          // Add slight offset for wall texture
          if (hitType === 'vertical') {
            const offset = (playerPos.y + rayDirection.y * distance) % 1;
            hitType = `vertical_${Math.floor(offset * 4)}`;
          } else {
            const offset = (playerPos.x + rayDirection.x * distance) % 1;
            hitType = `horizontal_${Math.floor(offset * 4)}`;
          }
        }
      }
    }

    // Calculate perpendicular distance to avoid fish-eye effect
    const perpendicularDistance = distance * Math.cos(rayAngle - this.state.player.rotation);
    
    return {
      distance: Math.min(perpendicularDistance, maxDistance),
      hitWall,
      hitType
    };
  }
}