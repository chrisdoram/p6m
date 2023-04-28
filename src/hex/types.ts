import { pointyDirection, flatDirection } from "./utils";

export type Direction = pointyDirection | flatDirection;

export enum Offsets {
  even = +1,
  odd = -1,
}
export type Cube = { q: number; r: number; s: number };
export type Axial =
  | { q: number; r: number }
  | { q: number; s: number }
  | { r: number; s: number };
export type Offset = { col: number; row: number };
export type Coordinates = Cube | Axial | Offset;

export type HexConfig = {
  offset: number;
  orientation: "FLAT" | "POINTY";
};
