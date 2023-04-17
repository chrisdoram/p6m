export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns a string representation of the Point in the form "x,y"
   * @returns {string}
   */
  public toString() {
    return `${this.x},${this.y}`;
  }
}
