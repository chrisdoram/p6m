import type { Coordinates, Cube, Offset, Axial, Offsets } from "./types";

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
export function isCube(x: Coordinates): x is Cube {
  return "q" in x && "r" in x && "s" in x;
}

/**
 * Returns true if coordinate is offset.
 */
export function isOffset(x: Coordinates): x is Offset {
  return "row" in x && "col" in x;
}

/**
 * Returns true if coordinate is axial.
 */
export function isAxial(x: Coordinates): x is Axial {
  return !isCube(x) && !isOffset(x);
}

/**
 * Converts axial coordinates into cube coordinates.
 */
export function fromAxial(coords: Axial): Cube {
  return {
    q: "q" in coords ? coords.q : -coords.r - coords.s,
    r: "r" in coords ? coords.r : -coords.q - coords.s,
    s: "s" in coords ? coords.s : -coords.q - coords.r,
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
