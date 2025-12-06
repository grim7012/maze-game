import {Vector2 } from '../../types/game.types';

export class Vec2 implements Vector2 {
  constructor(public x: number, public y: number) {}

  add(v: Vector2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  distanceTo(other: Vector2): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  normalize(): Vec2 {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length === 0) return new Vec2(0, 0);
    return new Vec2(this.x / length, this.y / length);
  }

  rotate(angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }
}