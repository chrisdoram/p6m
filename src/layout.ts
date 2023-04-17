import { Hex } from "./hex.js";
import { Orientation } from "./orientation.js";
import { Point } from "./point.js";

export class Layout {
  orientation: Orientation;
  size: Point;
  origin: Point;
  constructor(orientation: Orientation, size: Point, origin: Point) {
    this.orientation = orientation;
    this.size = size;
    this.origin = origin;
  }
  /**
   * Returns the coordinates of the center of Hex h
   * @param {Hex} h hex object to get pixel coordinates of
   * @returns {Point}
   */
  hexToPixel(h: Hex) {
    const f = this.orientation.f;
    let x = (f[0] * h.q + f[1] * h.r) * this.size.x;
    let y = (f[2] * h.q + f[3] * h.r) * this.size.y;
    return new Point(x + this.origin.x, y + this.origin.y);
  }
  /**
   * Returns the Hex that contains Point p
   * @param {Point} p pixel Point to convert to Hex coordinates
   * @returns {Hex}
   */
  pixelToHex(p: Point) {
    let pt = new Point(
      (p.x - this.origin.x) / this.size.x,
      (p.y - this.origin.y) / this.size.y
    );
    const b = this.orientation.b;
    let q = b[0] * pt.x + b[1] * pt.y;
    let r = b[2] * pt.x + b[3] * pt.y;
    return new Hex({ q: q, r: r, s: -q - r });
  }
  /**
   * returns the *offset* coordinates of a corner of a Hex
   * @param {number} corner index of the Hex corner, clockwise from north direction
   * @returns {Point}
   */
  hexCornerOffset(corner: number) {
    let angle = (2.0 * Math.PI * (this.orientation.startAngle - corner)) / 6.0;
    return new Point(
      this.size.x * Math.cos(angle),
      this.size.y * Math.sin(angle)
    );
  }
  /**
   * Returns all pixel coordinates of the corners of a hexagon
   * @param {Hex} hex hexagon to get corner pixel coordinates of
   * @returns {Point[]}
   */
  polygonCorners(hex: Hex) {
    let corners: Point[] = [];
    let center = this.hexToPixel(hex);
    for (let i = 0; i < 6; i++) {
      let offset = this.hexCornerOffset(i);
      corners.push(new Point(center.x + offset.x, center.y + offset.y));
    }
    return corners;
  }
}