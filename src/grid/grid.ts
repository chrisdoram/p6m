import { Orientation } from "..";
import { Hex, HexConstructor, HexCoordinates } from "../hex";
import { GridConfig, Point } from "./types";

const defaultGridConfig: GridConfig = {
  offset: +1,
  orientation: Orientation.pointy,
  size: { x: 10, y: 10 },
  origin: { x: 0, y: 0 },
  gutter: 0,
};

type CoordinateParams<T extends Hex> = {
  coords: Iterable<HexCoordinates>;
  hexConstructor?: HexConstructor<T>;
  config?: Partial<GridConfig>;
};

function isIterableOfCoordinates<T extends Hex>(
  p: CoordinateParams<T> | Iterable<HexCoordinates>
): p is Iterable<HexCoordinates> {
  return (p as Iterable<HexCoordinates>)[Symbol.iterator] !== undefined;
}

export class Grid<T extends Hex = Hex> {
  hexConstructor: HexConstructor<T> | undefined;
  static fromCoordinates(
    coordinates: Iterable<HexCoordinates>,
    config?: Partial<GridConfig>
  ): Grid<Hex>;
  static fromCoordinates<T extends Hex = Hex>(
    params: CoordinateParams<T>
  ): Grid<T>;
  static fromCoordinates<T extends Hex = Hex>(
    paramsOrCoords: CoordinateParams<T> | Iterable<HexCoordinates>,
    config?: Partial<GridConfig>
  ) {
    const hexes = [];
    if (isIterableOfCoordinates(paramsOrCoords)) {
      const gridConfig = config
        ? { ...defaultGridConfig, ...config }
        : defaultGridConfig;
      for (const c of paramsOrCoords) {
        hexes.push(new Hex(c));
      }
      return new Grid(hexes, gridConfig);
    } else {
      const { coords, hexConstructor, config } = paramsOrCoords;
      const gridConfig = config
        ? { ...defaultGridConfig, ...config }
        : defaultGridConfig;
      if (hexConstructor) {
        for (const c of coords) {
          hexes.push(new hexConstructor(c));
        }
        return new Grid<T>(hexes, gridConfig);
      } else {
        for (const c of coords) {
          hexes.push(new Hex(c));
        }
        return new Grid(hexes, gridConfig);
      }
    }
  }
  constructor();
  constructor(hexes: Iterable<T>, config?: GridConfig | Partial<GridConfig>);
  constructor(
    input?: Iterable<T>,
    {
      offset = +1,
      orientation = Orientation.pointy,
      size = { x: 10, y: 10 },
      origin = { x: 0, y: 0 },
      gutter = 0,
    }: GridConfig | Partial<GridConfig> | undefined = defaultGridConfig
  ) {
    this.config = { offset, orientation, size, origin, gutter };
    if (!input) return;
    const firstHex = input[Symbol.iterator]().next().value as T | undefined;
    if (!firstHex) {
      return;
    }
    this.hexConstructor = firstHex.constructor as HexConstructor<T>;
    for (const h of input) {
      // override the config object on the individual hexes
      h.config = {
        offset: offset,
        orientation: orientation === Orientation.flat ? "FLAT" : "POINTY",
      };
      this.setHex(h);
    }
  }

  private hexes = new Map<string, T>();
  readonly config: GridConfig;

  /**
   * Returns true if the orientation of the hexes in this grid are flat
   */
  private isFlat() {
    return this.config.orientation === Orientation.flat;
  }

  /**
   * Returns the number of hexes in the grid.
   */
  get size() {
    return this.hexes.size;
  }
  /**
   * Returns the pixel width of the grid.
   */
  get width() {
    if (this.size === 0) return 0;
    const hexes = this.toArray();
    const {
      0: l,
      length,
      [length - 1]: r,
    } = this.isFlat()
      ? hexes.sort((a, b) => a.q - b.q)
      : hexes.sort((a, b) => b.s - a.s || a.q - b.q);

    const lx = this.hexToPixel(l).x;
    const rx = this.hexToPixel(r).x;

    return rx - lx + this.hexWidth;
  }
  /**
   * Returns the pixel height of the grid.
   */
  get height() {
    if (this.size === 0) return 0;
    const hexes = this.toArray();
    const {
      0: t,
      length,
      [length - 1]: b,
    } = this.isFlat()
      ? hexes.sort((a, b) => b.s - a.s || a.r - b.r)
      : hexes.sort((a, b) => a.r - b.r);

    const ty = this.hexToPixel(t).y;
    const by = this.hexToPixel(b).y;

    return by - ty + this.hexHeight;
  }
  /**
   * Returns the pixel height of each hex in the grid.
   */
  get hexHeight() {
    const size = this.config.size;
    return this.isFlat() ? Math.sqrt(3) * size.y : 2 * size.y;
  }
  /**
   * returns the pixel width of each hex in the grid.
   */
  get hexWidth() {
    const size = this.config.size;
    return this.isFlat() ? 2 * size.x : Math.sqrt(3) * size.x;
  }
  /**
   * Returns the point coordinates of the center of a hex.
   */
  hexToPixel(h: T): Point {
    const f = this.config.orientation.f;
    let { x: sx, y: sy } = this.config.size;
    let x = (f[0] * h.q + f[1] * h.r) * sx;
    let y = (f[2] * h.q + f[3] * h.r) * sy;
    return { x, y };
  }
  /**
   * Returns the hex that contains a point.
   */
  pixelToHex(point: Point) {
    const { origin, size, orientation } = this.config;
    let pt = {
      x: (point.x - origin.x) / size.x,
      y: (point.y - origin.y) / size.y,
    };
    const b = orientation.b;
    let q = b[0] * pt.x + b[1] * pt.y;
    let r = b[2] * pt.x + b[3] * pt.y;
    return new Hex({ q: q, r: r, s: -q - r });
  }

  setHex(hex: T) {
    this.hexes.set(hex.toString(), hex);
  }
  getHex(hex: T) {
    return this.hexes.get(hex.toString());
  }
  hasHex(hex: T): boolean {
    return this.hexes.has(hex.toString());
  }

  filter(predicate: (hex: T) => boolean) {
    const result: T[] = [];
    for (const h of this) {
      if (predicate(h)) result.push(h);
    }
    return new Grid(result, this.config);
  }
  map(fn: (hex: T) => T): Grid<T> {
    const result: T[] = [];
    for (const h of this) {
      result.push(fn(h));
    }
    return new Grid(result, this.config);
  }
  forEach(fn: (hex: T) => void) {
    for (const h of this) {
      fn(h);
    }
  }

  toArray() {
    return Array.from(this);
  }
  toString() {
    return `${this.constructor.name}(${this.size})`;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.hexes.values();
  }
}
