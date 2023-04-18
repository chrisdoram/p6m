import { Layout } from "./layout";

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
  context: Layout | undefined;

  constructor(coordinates: Coordinates, context?: Layout) {
    const { q, r, s } = Hex.toCuboid(coordinates);
    this.q = q;
    this.r = r;
    this.s = s;
    if (q + r + s !== 0) {
      throw new RangeError(`Hex(${q}, ${r}, ${s}) invalid: does not zero-sum`);
    }
    this.context = context;
  }

  /**
   * Axial vectors of the six neighboring Hex's.
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
   * Convert coordinates into cuboid coordinates.
   * @param {Coordinates} coordinates axial, cartesian or cuboid coordinates.
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
   * Convert axial coordinates into cuboid coordinates.
   * @param {Axial} coordinates axial coordinates.
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
   * Convert cartesian coordinates into cuboid coordinates.
   * @param {Cartesian} coordinates cartesian coordinates.
   * @returns {Cuboid}
   */
  private static fromCartesian(coordinates: Cartesian): Cuboid {
    const { row, col, offset } = coordinates;
    return Hex.fromAxial({
      q: col,
      r: row - (col + offset * (col & 1)) / 2,
    });
  }

  /**
   * Returns a string representation of this Hex in the form "hex(q,r,s)".
   * @returns {string}
   */
  public toString() {
    return `hex(${this.q},${this.r},${this.s})`;
  }

  /**
   * Compare equality between this Hex and another Hex.
   * @param {Hex} b another Hex.
   * @returns {boolean}
   */
  public equals(b: Hex) {
    return this.q === b.q && this.r === b.r && this.s === b.s;
  }

  /**
   * Add vector to this Hex.
   * @param {Hex} vec the Hex vector to add to this Hex.
   * @returns {Hex}
   */
  public add(vec: Hex) {
    return new Hex({ q: this.q + vec.q, r: this.r + vec.r });
  }

  /**
   * Subtract vector from this Hex.
   * @param {Hex} vec the Hex vector to subtract from this Hex.
   * @returns {Hex}
   */
  public subtract(vec: Hex) {
    return new Hex({ q: this.q - vec.q, r: this.r - vec.r });
  }

  /**
   * Scale this Hex by a constant k.
   * @param {number} k the constant to scale by.
   * @returns {Hex}
   */
  public scale(k: number) {
    return new Hex({ q: this.q * k, r: this.r * k });
  }

  /**
   * Rotate this Hex vector 60 degrees anti-clockwise.
   * @returns {Hex}
   */
  public rotateLeft() {
    return new Hex({ q: -this.s, r: -this.q, s: -this.r });
  }

  /**
   * Rotate this Hex vector 60 degrees clockwise.
   * @returns {Hex}
   */
  public rotateRight() {
    return new Hex({ q: -this.r, r: -this.s, s: -this.q });
  }

  /**
   * Returns the neighboring hex in the given direction.
   * @param {Direction} direction the direction of the neighbor from N (flat-top) or NE (pointy-top)
   * @returns {Hex}
   */
  public neighbor(direction: Direction) {
    if (!(direction >= 0 && direction <= 5)) {
      throw new Error("Direction must be between 0 and 5");
    }
    return this.add(new Hex(Hex.DIRECTION_VECTORS[direction]));
  }

  /**
   * Returns all 6 neighbors of this Hex.
   * @returns {Hex[]}
   */
  public allNeighbors() {
    const n: Hex[] = [];
    for (let d of Hex.DIRECTION_VECTORS) {
      n.push(this.add(new Hex(d)));
    }
    return n;
  }

  /**
   * Returns the length of the Hex vector in cuboid coordinates.
   * @returns {number}
   */
  public length() {
    const abs = Math.abs;
    return (abs(this.q) + abs(this.r) + abs(this.s)) / 2;
  }

  /**
   * Returns the distance between this Hex and another Hex.
   * @param {Hex} b the other Hex.
   * @returns {number}
   */
  public distance(b: Hex) {
    return this.subtract(b).length();
  }

  /**
   * Round this Hex to the nearest integer Hex.
   * @returns {Hex}
   */
  public round() {
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
   * Returns the coordinates of the center of this hex.
   * @returns {Point}
   */
  public toPoint() {
    if (!this.context) {
      throw new ReferenceError("No layout context for converting to a point");
    }
    return this.context.hexToPixel(this);
  }

  /**
   * Returns all pixel coordinates of the corners of this hex.
   * @returns {Point[]}
   */
  public toCoordinates(ignoreGutter: boolean = false) {
    if (!this.context) {
      throw new ReferenceError(
        "No layout context for converting to coordinates"
      );
    }
    return this.context.polygonCorners(this, ignoreGutter);
  }

  /**
   * Returns all pixel coordinates of the corners of this hex.
   * @returns {Point[]}
   */
  public arcCoordinates(size: number, ignoreGutter: boolean = false) {
    if (!this.context) {
      throw new ReferenceError(
        "No layout context for converting to coordinates"
      );
    }
    return this.context.getCornerArcs(this, size, ignoreGutter);
  }
}
