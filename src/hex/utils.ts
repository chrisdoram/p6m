import type {
  Cube,
  Offset,
  Axial,
  Offsets,
  HexCoordinates,
  AxialTuple,
  CubeTuple,
  PartialCoordinates,
} from "./types";

/**
 * Enum describing the 6 compass directions of a pointy hex's neighbors.
 */
export enum pointyDirection {
  E,
  SE,
  SW,
  W,
  NW,
  NE,
}

/**
 * Enum describing the 6 compass directions of a flat hex's neighbors.
 */
export enum flatDirection {
  SE,
  S,
  SW,
  NW,
  N,
  NE,
}

/**
 * Returns true if coordinate id cube.
 */
export function isCube(x: HexCoordinates): x is Cube | CubeTuple {
  return Array.isArray(x) ? x.length === 3 : "q" in x && "r" in x && "s" in x;
}

/**
 * Returns true if coordinate is offset.
 */
export function isOffset(x: HexCoordinates): x is Offset {
  return "row" in x && "col" in x;
}

/**
 * Returns true if coordinate is axial.
 */
export function isAxial(x: HexCoordinates): x is Axial | AxialTuple {
  return Array.isArray(x)
    ? x.length === 2
    : "q" in x && "r" in x && !("s" in x);
}

/**
 * Returns true if coordinate is PartialCoordinate
 */
export function isPartial(x: HexCoordinates): x is PartialCoordinates {
  return !isCube(x) && !isAxial(x) && !isOffset(x);
}

/**
 * Converts axial coordinates into cube coordinates.
 */
export function fromAxial(coords: Axial | AxialTuple): Cube {
  if (Array.isArray(coords)) {
    return { q: coords[0], r: coords[1], s: -coords[0] - coords[1] };
  }
  return {
    ...coords,
    s: -coords.q - coords.r,
  };
}

/**
 * Converts offset coordinates into cube coordinates.
 */
export function fromOffset(
  coordinates: Offset,
  offset: Offsets,
  orientation: "POINTY" | "FLAT"
): Cube {
  const { row, col } = coordinates;
  const isPointy = orientation === "POINTY";
  return fromAxial({
    q: isPointy ? col - (row + offset * (row & 1)) / 2 : col,
    r: isPointy ? row : row - (col + offset * (col & 1)) / 2,
  });
}

export function fromPartial(coords: PartialCoordinates): Cube {
  return {
    q: "q" in coords ? coords.q : -coords.r - coords.s,
    r: "r" in coords ? coords.r : -coords.q - coords.s,
    s: "s" in coords ? coords.s : -coords.q - coords.r,
  };
}
