import { Hex } from "./hex/hex.js";
import { Layout } from "./layout.js";
import { Orientation } from "./orientation.js";
import { Point } from "./point.js";

export class Grid<T extends Hex> {
  tiles: Record<string, T>;
  layout: Layout;
  constructor(
    nodes: T[],
    orientation: Orientation = Orientation.pointy,
    size: Point = new Point(10, 10),
    origin: Point = new Point(0, 0),
    gutter: number = 0
  ) {
    this.layout = new Layout(orientation, size, origin, gutter);
    this.tiles = {};
    nodes.forEach((node) => {
      node.context = this.layout;
      this.tiles[node.toString()] = node;
    });
  }
  /**
   * Return an array of all of the nodes in the grid.
   * @returns {Hex[]}
   */
  toArray() {
    return Object.values(this.tiles);
  }
}
