import type {
  Coordinates,
  Cube,
  Offset,
  Axial,
  HexConfig,
  Direction,
  Offsets,
} from "./types";

import { isAxial, fromAxial, isOffset, fromOffset } from "./utils";

export class Hex implements Readonly<Cube>, Readonly<Offset> {
  readonly q: number;
  readonly r: number;
  readonly s: number;
  readonly config: HexConfig;

  constructor(
    coordinates: Coordinates,
    { offset = 1, orientation = "POINTY" }: Partial<HexConfig> = {
      offset: 1,
      orientation: "POINTY",
    }
  ) {
    this.config = { offset, orientation };
    const { q, r, s } = Hex.toCube(coordinates, offset, orientation);
    this.q = q;
    this.r = r;
    this.s = s;
    if (q + r + s !== 0) {
      throw new RangeError(`Hex(${q}, ${r}, ${s}) invalid: does not zero-sum`);
    }
  }

  get col() {
    const isPointy = this.config.orientation === "POINTY";
    return isPointy
      ? this.q + (this.r + this.config.offset * (this.r & 1)) / 2
      : this.q;
  }

  get row() {
    const isPointy = this.config.orientation === "POINTY";
    return isPointy
      ? this.r
      : this.r + (this.q + this.config.offset * (this.q & 1)) / 2;
  }

  /**
   * Axial vectors of the six neighboring Hex's.
   */
  private static DIRECTION_VECTORS: Axial[] = [
    { q: +1, r: 0 },
    { q: 0, r: +1 },
    { q: -1, r: +1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: +1, r: -1 },
  ];

  /**
   * Convert coordinates into cube coordinates.
   * @param {Coordinates} coordinates axial, cartesian or cube coordinates.
   * @returns {Cuboid}
   */
  private static toCube(
    coordinates: Coordinates,
    offset: Offsets,
    orientation: "POINTY" | "FLAT"
  ): Cube {
    if (isAxial(coordinates)) {
      return fromAxial(coordinates);
    } else if (isOffset(coordinates)) {
      return fromOffset(coordinates, offset, orientation);
    } else {
      return coordinates;
    }
  }

  /**
   * Returns a string representation of this Hex.
   * This is helpful for logging and hashing.
   * @returns {string}
   */
  public toString() {
    return `${this.constructor.name}(${this.q},${this.r},${this.s})`;
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
      const isPointy = this.config.orientation === "POINTY";
      throw new Error(
        `Direction must be between 0 (${
          isPointy ? "East" : "South East"
        }) and 5 (${isPointy ? "North East" : "North"})`
      );
    }
    return this.add(new Hex(Hex.DIRECTION_VECTORS[direction]));
  }

  /**
   * Returns all 6 neighbors of this Hex.
   * @returns {Hex[]}
   */
  public get neighbors() {
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

  // /**
  //  * Returns the coordinates of the center of this hex.
  //  * @returns {Point}
  //  */
  // public toPoint() {
  //   if (!this.context) {
  //     throw new ReferenceError("No layout context for converting to a point");
  //   }
  //   return this.context.hexToPixel(this);
  // }

  // /**
  //  * Returns all pixel coordinates of the corners of this hex.
  //  * @returns {Point[]}
  //  */
  // public toCoordinates(ignoreGutter: boolean = false) {
  //   if (!this.context) {
  //     throw new ReferenceError(
  //       "No layout context for converting to coordinates"
  //     );
  //   }
  //   return this.context.polygonCorners(this, ignoreGutter);
  // }

  // /**
  //  * Returns all pixel coordinates of the corners of this hex.
  //  * @returns {Point[]}
  //  */
  // public arcCoordinates(size: number, ignoreGutter: boolean = false) {
  //   if (!this.context) {
  //     throw new ReferenceError(
  //       "No layout context for converting to coordinates"
  //     );
  //   }
  //   return this.context.getCornerArcs(this, size, ignoreGutter);
  // }
}
