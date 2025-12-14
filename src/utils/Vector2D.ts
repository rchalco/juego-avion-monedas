// Clase para vectores 2D - útil para posiciones y velocidades
export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  // Suma de vectores
  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  // Resta de vectores
  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  // Multiplicación por escalar
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  // Magnitud del vector
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Normalizar vector
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  // Distancia a otro vector
  distanceTo(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Clonar vector
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  // Establecer valores
  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}