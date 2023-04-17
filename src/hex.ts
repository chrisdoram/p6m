import { Layout } from "./layout.js";

export enum pointyDirection {
  NE,
  E,
  SE,
  SW,
  NW,
  N,
}

export enum flatDirection {
  NE,
  SE,
  S,
  SW,
  NW,
  N,
}

export type Direction = pointyDirection | flatDirection;

export enum Offset {
  even = +1,
  odd = -1,
}
export type Cuboid = { q: number; r: number; s: number };
export type Axial = { q: number; r: number };
export type Cartesian = { col: number; row: number; offset: Offset };
export type Coordinates = Cuboid | Axial | Cartesian;

export function isCuboid(x: Coordinates): x is Cuboid {
  return "s" in x;
}

export function isCartesian(x: Coordinates): x is Cartesian {
  return "row" in x && "col" in x && "offset" in x;
}

export function isAxial(x: Coordinates): x is Axial {
  return !isCuboid(x) && !isCartesian(x);
}

export class Hex {
  readonly q: number;
  readonly r: number;
  readonly s: number;
  private _context: Layout | undefined;

  constructor(coordinates: Coordinates, context?: Layout) {
    const { q, r, s } = Hex.toCuboid(coordinates);
    this.q = q;
    this.r = r;
    this.s = s;
    if (q + r + s !== 0) {
      throw new RangeError(`Hex(${q}, ${r}, ${s}) invalid: does not zero-sum`);
    }
    this._context = context;
  }

  /**
   * vector directions of neighboring Hex's
   */
  private static DIRECTION_VECTORS: Axial[] = [
    { q: +1, r: -1 },
    { q: +1, r: 0 },
    { q: 0, r: +1 },
    { q: -1, r: +1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
  ];

  /**
   * Convert coordinates into Cuboid coordinates
   * @param {Coordinates} coordinates coordinates of a Hex
   * @returns {Cuboid}
   */
  private static toCuboid(coordinates: Coordinates): Cuboid {
    if (isAxial(coordinates)) {
      return Hex.fromAxial(coordinates);
    } else if (isCartesian(coordinates)) {
      return Hex.fromCartesian(coordinates);
    } else {
      return coordinates;
    }
  }

  /**
   * Convert axial coordinates into Cuboid coordinates
   * @param {Axial} coordinates axial coordinates of a hex
   * @returns {Cuboid}
   */
  private static fromAxial(coordinates: Axial): Cuboid {
    return {
      q: coordinates.q,
      r: coordinates.r,
      s: -coordinates.q - coordinates.r,
    };
  }

  /**
   * Convert cartesian coordinates into Cuboid coordinates
   * @param {Cartesian} coordinates cartesian coordinates of a hex
   * @returns {Cuboid}
   */
  private static fromCartesian(coordinates: Cartesian): Cuboid {
    const { row, col, offset } = coordinates;
    return Hex.fromAxial({
      q: col,
      r: row - (col + offset * (col & 1)) / 2,
    });
  }

  public set context(context: Layout) {
    this._context = context;
  }

  /**
   * returns a string representation of this Hex "hex(q,r,s)"
   * @returns {string}
   */
  public toString() {
    return `hex(${this.q},${this.r},${this.s})`;
  }

  /**
   * Compare equality between this Hex and b
   * @param {Hex} b Hex to test for equality
   * @returns {boolean}
   */
  equals(b: Hex) {
    return this.q === b.q && this.r === b.r && this.s === b.s;
  }

  /**
   * Add vec to this Hex
   * @param {Hex} vec The Hex vector to add to this Hex
   * @returns {Hex}
   */
  add(vec: Hex) {
    return new Hex({ q: this.q + vec.q, r: this.r + vec.r });
  }

  /**
   * Subtract vex from this Hex
   * @param {Hex} vec The Hex vector to subtract from this Hex
   * @returns {Hex}
   */
  subtract(vec: Hex) {
    return new Hex({ q: this.q - vec.q, r: this.r - vec.r });
  }

  /**
   * Scale this Hex by a constant k
   * @param {number} k
   * @returns {Hex}
   */
  scale(k: number) {
    return new Hex({ q: this.q * k, r: this.r * k });
  }

  /**
   * Rotate this Hex vector 60 degrees anti-clockwise
   * @returns {Hex}
   */
  rotateLeft() {
    return new Hex({ q: -this.s, r: -this.q, s: -this.r });
  }

  /**
   * Rotate this Hex vector 60 degrees clockwise
   * @returns {Hex}
   */
  rotateRight() {
    return new Hex({ q: -this.r, r: -this.s, s: -this.q });
  }

  /**
   * Returns the neighboring hex in the given direction
   * @param {number} direction the direction of the neighbor from N (flat-top) or NE (pointy-top)
   * @returns {Hex}
   */
  neighbor(direction: Direction) {
    if (!(direction >= 0 && direction <= 5)) {
      throw new Error("Direction must be between 0 and 5");
    }
    return this.add(new Hex(Hex.DIRECTION_VECTORS[direction]));
  }

  /**
   * Returns all 6 neighbors of this Hex
   * @returns {Hex[]}
   */
  allNeighbors() {
    const n: Hex[] = [];
    for (let d of Hex.DIRECTION_VECTORS) {
      n.push(this.add(new Hex(d)));
    }
    return n;
  }

  /**
   * Returns the length of the Hex vector in Cube coordinates
   * @returns {number}
   */
  length() {
    const abs = Math.abs;
    return (abs(this.q) + abs(this.r) + abs(this.s)) / 2;
  }

  /**
   * Returns the distance between this Hex and b
   * @param {Hex} b
   * @returns {number}
   */
  distance(b: Hex) {
    return this.subtract(b).length();
  }

  /**
   * Round this Hex to the nearest integer Hex
   * @returns {Hex}
   */
  round() {
    // rounds hex in float coords to int coords
    let qi = Math.round(this.q);
    let ri = Math.round(this.r);
    let si = Math.round(this.s);
    let q_diff = Math.abs(qi - this.q);
    let r_diff = Math.abs(ri - this.r);
    let s_diff = Math.abs(si - this.s);
    if (q_diff > r_diff && q_diff > s_diff) {
      qi = -ri - si;
    } else if (r_diff > s_diff) {
      ri = -qi - si;
    } else {
      si = -qi - ri;
    }
    return new Hex({ q: qi, r: ri });
  }

  /**
   * Returns the coordinates of the center of this hex
   * @returns {Point}
   */
  toPoint() {
    if (!this._context) {
      throw new ReferenceError("No layout context for converting to a point");
    }
    return this._context.hexToPixel(this);
  }

  /**
   * Returns all pixel coordinates of the corners of this hex
   * @returns {Point[]}
   */
  toCoordinates() {
    if (!this._context) {
      throw new ReferenceError(
        "No layout context for converting to coordinates"
      );
    }
    return this._context.polygonCorners(this);
  }

  /**
   * TODO : put the below methods in a utils lib
   */

  /**
   * Linear interpolation between this Hex and b with step size t
   * @param {Hex} b Hex to interpolate between
   * @param {number} t step
   * @returns {Hex}
   */
  lerp(b: Hex, t: number) {
    const _lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
    // t = 1.0/N * i
    // where N is the int hex distance between the endpoints
    // i is the current hex being sampled
    return new Hex({ q: _lerp(this.q, b.q, t), r: _lerp(this.r, b.r, t) });
  }

  /**
   * Returns an array of Hex's between this Hex and b
   * @param {Hex} b target Hex of the line
   * @returns {Hex[]}
   */
  lineDraw(b: Hex) {
    let N = this.distance(b);
    var aNudge = new Hex({
      q: this.q + 1e-6,
      r: this.r + 1e-6,
      s: this.s - 2e-6,
    });
    var bNudge = new Hex({ q: b.q + 1e-6, r: b.r + 1e-6, s: b.s - 2e-6 });
    let results: Hex[] = [];
    for (let i = 0; i <= N; i++) {
      // Math.max there to handle 0 length line case (A == B)
      results.push(aNudge.lerp(bNudge, (1.0 / Math.max(N, 1)) * i).round());
    }
    return results;
  }
}
