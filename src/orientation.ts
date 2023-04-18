export type Mat2 = [number, number, number, number];

export class Orientation {
  // 2x2 forward matrix
  f: Mat2;
  // 2x2 inverse matrix
  b: Mat2;
  startAngle: number;
  // these increase in 60 degree or PI/3 increments
  // angle of left edge from start corner
  startAngleL: number;
  // angle of right edge from start corner
  startAngleR: number;

  private constructor(
    f: Mat2,
    b: Mat2,
    startAngle: number,
    startAngleL: number,
    startAngleR: number
  ) {
    this.f = f;
    this.b = b;
    this.startAngle = startAngle;
    this.startAngleL = startAngleL;
    this.startAngleR = startAngleR;
  }
  public static pointy = new Orientation(
    [Math.sqrt(3), Math.sqrt(3) / 2, 0, 3 / 2],
    [Math.sqrt(3) / 3, -1 / 3, 0, 2 / 3],
    Math.PI / 6,
    (3 / 2) * Math.PI,
    (5 / 6) * Math.PI
  );
  public static flat = new Orientation(
    [3 / 2, 0, Math.sqrt(3) / 2, Math.sqrt(3)],
    [2 / 3, 0, -1 / 3, Math.sqrt(3) / 3],
    0,
    (4 / 3) * Math.PI,
    (2 / 3) * Math.PI
  );
}
