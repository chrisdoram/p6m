export type Mat2 = [number, number, number, number];

export class Orientation {
  // 2x2 forward matrix
  f: Mat2;
  // 2x2 inverse matrix
  b: Mat2;
  startAngle: number;

  private constructor(f: Mat2, b: Mat2, startAngle: number) {
    this.f = f;
    this.b = b;
    this.startAngle = startAngle;
  }
  public static pointy = new Orientation(
    [Math.sqrt(3), Math.sqrt(3) / 2, 0, 3 / 2],
    [Math.sqrt(3) / 3, -1 / 3, 0, 2 / 3],
    0.5
  );
  public static flat = new Orientation(
    [3 / 2, 0, Math.sqrt(3) / 2, Math.sqrt(3)],
    [2 / 3, 0, -1 / 3, Math.sqrt(3) / 3],
    0
  );
}
