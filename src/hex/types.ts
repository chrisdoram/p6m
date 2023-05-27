import { Hex } from ".";
import { pointyDirection, flatDirection } from "./utils";

export type Direction = pointyDirection | flatDirection;

export enum Offsets {
  even = +1,
  odd = -1,
}
export interface Cube {
  q: number;
  r: number;
  s: number;
}
export interface Axial {
  q: number;
  r: number;
}
export interface Offset {
  col: number;
  row: number;
}
export type Coordinates = Cube | Axial | Offset;

export type PartialCoordinates =
  | { q: number; r: number }
  | { q: number; s: number }
  | { r: number; s: number };
export type AxialTuple = [q: number, r: number];
export type CubeTuple = [q: number, r: number, s: number];

export type HexCoordinates =
  | Coordinates
  | PartialCoordinates
  | AxialTuple
  | CubeTuple;

export type HexConfig = {
  offset: number;
  orientation: "FLAT" | "POINTY";
};

export type HexConstructor<T extends Hex> = new (
  coords: HexCoordinates,
  config?: HexConfig
) => T;
