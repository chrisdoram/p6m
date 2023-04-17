import { Hex } from "./hex.js";
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
    origin: Point = new Point(0, 0)
  ) {
    this.layout = new Layout(orientation, size, origin);
    this.tiles = {};
    nodes.forEach((node) => {
      node.context = this.layout;
      this.tiles[node.toString()] = node;
    });
  }
  toArray() {
    return Object.values(this.tiles);
  }
}
