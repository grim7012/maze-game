export type CellType = 'wall' | 'path' | 'start' | 'goal' | 'visited';

export interface MazeCell {
  type: CellType;
  x: number;
  y: number;
  textureIndex?: number; // For different wall textures
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Extended Vector2 with methods
export interface Vector2Methods {
  add(v: Vector2): Vector2;
  subtract(v: Vector2): Vector2;
  multiply(scalar: number): Vector2;
  distanceTo(v: Vector2): number;
  normalize(): Vector2;
  rotate(angle: number): Vector2;
  clone(): Vector2;
}

export type Vec2Type = Vector2 & Vector2Methods;

export interface Player {
  position: Vec2Type;
  rotation: number; // in radians
  fieldOfView: number;
  velocity?: Vector2;
}

export interface GameEffects {
  bobAmount: number;
  bobSpeed: number;
  swayAmount: number;
  lastStepTime: number;
  fogAmount?: number;
}

export interface GameState {
  maze: MazeCell[][];
  player: Player;
  goalPosition: Vec2Type;
  gameStatus: 'playing' | 'won' | 'paused';
  moves: number;
  effects: GameEffects;
  movementHistory?: Vec2Type[];
  visitedCells?: Set<string>;
}

export interface RaycastResult {
  distance: number;
  hitWall: boolean;
  hitType: string;
  wallNormal?: Vector2;
  textureCoords?: Vector2;
}

export interface CollisionResult {
  collision: boolean;
  newPosition: Vec2Type;
  slideVector?: Vector2;
  normal?: Vector2;
}

export interface GameConfig {
  mazeWidth: number;
  mazeHeight: number;
  cellSize: number;
  playerSpeed: number;
  rotationSpeed: number;
  fov: number;
  maxRayDistance: number;
  playerRadius?: number;
  wallThickness?: number;
  smoothFactor?: number;
}export interface WallTexture {
  color: string;
  pattern: number[]; // RGB multipliers [r, g, b]
  lightAbsorption: number;
  roughness: number;
  specular: number;
}

export interface GraphicsSettings {
  resolution: number;
  antiAliasing: boolean;
  shadows: boolean;
  reflections: boolean;
  postProcessing: boolean;
  textureQuality: 'low' | 'medium' | 'high';
  fogQuality: 'off' | 'low' | 'high';
}

export interface AudioSettings {
  master: number;
  sfx: number;
  music: number;
  ambient: number;
  enable3DAudio: boolean;
  reverb: boolean;
}

export interface ControlSettings {
  mouseSensitivity: number;
  invertMouseY: boolean;
  keybinds: Record<string, string>;
  controllerEnabled: boolean;
  vibration: boolean;
}

export interface UISettings {
  showMinimap: boolean;
  showCrosshair: boolean;
  showStats: boolean;
  showFPS: boolean;
  uiScale: number;
  theme: 'dark' | 'light' | 'auto';
}

export interface GameSettings {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
  ui: UISettings;
  accessibility: {
    colorBlindMode: 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    highContrast: boolean;
    subtitleSize: 'small' | 'medium' | 'large';
    reduceMotion: boolean;
  };
}

export interface GameStats {
  moves: number;
  timePlayed: number; // in seconds
  gamesPlayed: number;
  gamesWon: number;
  averageMoves: number;
  bestTime?: number;
  worstTime?: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockDate?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'dust' | 'sparkle' | 'smoke' | 'blood';
}

export interface TrailPoint {
  position: Vec2Type;
  time: number;
  intensity: number;
}

export interface LightingPoint {
  position: Vector2;
  radius: number;
  intensity: number;
  color: string;
  flicker?: boolean;
}

export interface GameSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  moves: number;
  mazeSeed?: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  completed: boolean;
  score?: number;
}

export interface MazeMetadata {
  seed: number;
  generationTime: number;
  complexity: number; // 0-1
  deadEnds: number;
  solutionLength: number;
  symmetry: 'none' | 'horizontal' | 'vertical' | 'rotational';
  theme?: string;
}

// Event types for the game engine
export interface GameEvent {
  type: 'move' | 'rotate' | 'collision' | 'goal_reached' | 'pause' | 'reset';
  timestamp: number;
  data?: any;
}

export interface GameEventMove extends GameEvent {
  type: 'move';
  data: {
    from: Vector2;
    to: Vector2;
    direction: Vector2;
  };
}

export interface GameEventCollision extends GameEvent {
  type: 'collision';
  data: {
    position: Vector2;
    normal: Vector2;
    force: number;
  };
}

// Animation types
export interface Animation {
  id: string;
  type: 'fade' | 'slide' | 'scale' | 'rotate';
  duration: number;
  easing: string;
  from: any;
  to: any;
  onComplete?: () => void;
}

// Sound types
export interface SoundEffect {
  id: string;
  url: string;
  volume: number;
  loop: boolean;
  spatial: boolean;
  position?: Vector2;
}

// For the enhanced minimap
export interface MinimapConfig {
  size: number;
  cellSize: number;
  showTrail: boolean;
  showFog: boolean;
  showGrid: boolean;
  playerArrow: boolean;
  zoom: number;
  opacity: number;
}

// For the enhanced first-person view
export interface ViewConfig {
  width: number;
  height: number;
  quality: 'low' | 'medium' | 'high';
  showEffects: boolean;
  fov: number;
  aspectRatio: number;
  enablePostProcessing: boolean;
}

// Export utility types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Game mode types
export type GameMode = 'classic' | 'time_trial' | 'survival' | 'exploration';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

// Power-up types
export type PowerUpType = 'speed_boost' | 'vision_boost' | 'ghost_mode' | 'teleport';

export interface PowerUp {
  type: PowerUpType;
  position: Vector2;
  duration: number;
  active: boolean;
  collected: boolean;
  sprite?: string;
}

// Enemy types
export interface Enemy {
  id: string;
  position: Vector2;
  patrolPath: Vector2[];
  speed: number;
  detectionRadius: number;
  state: 'patrol' | 'chase' | 'idle';
  lastSeenPlayer?: Vector2;
}

// For save/load functionality
export interface SaveData {
  version: string;
  timestamp: Date;
  gameState: GameState;
  stats: GameStats;
  settings: GameSettings;
  session: GameSession;
  mazeMetadata: MazeMetadata;
}

// For network/multiplayer (future)
export interface PlayerData {
  id: string;
  name: string;
  color: string;
  position: Vector2;
  rotation: number;
  score: number;
  ping: number;
}

// For particle systems
export interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number;
  lifetime: number;
  size: number;
  color: string | string[];
  velocity: Vector2;
  spread: number;
  gravity: number;
  fade: boolean;
}