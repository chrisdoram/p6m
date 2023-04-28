import { Hex } from "./hex/hex.js";
import { Orientation } from "./orientation.js";
import { Point } from "./point.js";

export class Layout {
  orientation: Orientation;
  size: Point;
  origin: Point;
  gutter: number;
  constructor(
    orientation: Orientation,
    size: Point,
    origin: Point,
    gutter: number = 0
  ) {
    this.orientation = orientation;
    this.size = size;
    this.origin = origin;
    this.gutter = gutter;
  }

  /**
   * Returns the pixel coordinates of the center of a Hex.
   * @param {Hex} h Hex
   * @returns {Point}
   */
  public hexToPixel(h: Hex) {
    const f = this.orientation.f;
    let x = (f[0] * h.q + f[1] * h.r) * this.size.x;
    let y = (f[2] * h.q + f[3] * h.r) * this.size.y;
    return new Point(x + this.origin.x, y + this.origin.y);
  }

  /**
   * Returns the Hex that contains Point p.
   * @param {Point} p pixel Point to convert to Hex coordinates.
   * @returns {Hex}
   */
  public pixelToHex(p: Point) {
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
   * Returns the *offset* coordinates of a corner of a Hex.
   * @param {number} corner index of the Hex corner, clockwise from north direction
   * @returns {Point}
   */
  private hexCornerOffset(corner: number, ignoreGutter: boolean = false) {
    // let angle = (2.0 * Math.PI * (this.orientation.startAngle - corner)) / 6.0;
    let angle = this.orientation.startAngle + (Math.PI / 3) * corner;
    if (ignoreGutter) {
      return new Point(
        this.size.x * Math.cos(angle),
        this.size.y * Math.sin(angle)
      );
    } else {
      return new Point(
        (this.size.x - this.gutter / 2) * Math.cos(angle),
        (this.size.y - this.gutter / 2) * Math.sin(angle)
      );
    }
  }
  /**
   * Returns all pixel coordinates of the corners of a hexagon.
   * @param {Hex} hex Hex
   * @returns {Point[]}
   */
  public polygonCorners(hex: Hex, ignoreGutter: boolean = false) {
    let corners: Point[] = [];
    let center = this.hexToPixel(hex);
    for (let i = 0; i < 6; i++) {
      let offset = this.hexCornerOffset(i, ignoreGutter);
      corners.push(new Point(center.x + offset.x, center.y + offset.y));
    }
    return corners;
  }

  /**
   * Returns the *offset* coordinates of an arc
   * @param {number} corner corner index (from 0 clockwise)
   * @param {number} size the distance from the corner to the start (& end) of the arc.
   */
  private arcCornerOffsets(corner: number, size: number) {
    const step = (1 / 3) * Math.PI * corner;
    const lAngle = this.orientation.startAngleL + step;
    const rAngle = this.orientation.startAngleR + step;
    return {
      l: new Point(size * Math.cos(lAngle), size * Math.sin(lAngle)),
      r: new Point(size * Math.cos(rAngle), size * Math.sin(rAngle)),
    };
  }

  /**
   * Returns the start (l) and end (r) coordinates of each arc where index 0 is the first corner of the hexagon.
   * @param {Hex} hex Hex
   * @param {number} size the distance from the corner to the start (& end) of the arc.
   * @param {boolean} ignoreGutter whether the gutter should be ignored in the calculations.
   */
  public getCornerArcs(hex: Hex, size: number, ignoreGutter: boolean = false) {
    let arcs: { l: Point; r: Point }[] = [];
    let corners = this.polygonCorners(hex, ignoreGutter);
    for (let i = 0; i < 6; i++) {
      let offsets = this.arcCornerOffsets(i, size);
      arcs.push({
        l: new Point(corners[i].x + offsets.l.x, corners[i].y + offsets.l.y),
        r: new Point(corners[i].x + offsets.r.x, corners[i].y + offsets.r.y),
      });
    }
    return arcs;
  }
}
