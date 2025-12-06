import { type Vector3 } from '../../types/game.types';

export class Vec3 implements Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  add(v: Vector3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: Vector3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  multiply(scalar: number): Vec3 {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  divide(scalar: number): Vec3 {
    return new Vec3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vec3 {
    const len = this.length();
    if (len === 0) return new Vec3(0, 0, 0);
    return new Vec3(this.x / len, this.y / len, this.z / len);
  }

  distanceTo(v: Vector3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  lerp(v: Vector3, t: number): Vec3 {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  equals(v: Vector3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  static fromArray(arr: [number, number, number]): Vec3 {
    return new Vec3(arr[0], arr[1], arr[2]);
  }

  static zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  static one(): Vec3 {
    return new Vec3(1, 1, 1);
  }

  static up(): Vec3 {
    return new Vec3(0, 1, 0);
  }

  static down(): Vec3 {
    return new Vec3(0, -1, 0);
  }

  static left(): Vec3 {
    return new Vec3(-1, 0, 0);
  }

  static right(): Vec3 {
    return new Vec3(1, 0, 0);
  }

  static forward(): Vec3 {
    return new Vec3(0, 0, 1);
  }

  static back(): Vec3 {
    return new Vec3(0, 0, -1);
  }
}