import { Orientation } from "..";

export type Point = { x: number; y: number };

export type GridConfig = {
  offset: number;
  orientation: Orientation;
  size: Point;
  origin: Point;
  gutter: number;
};
