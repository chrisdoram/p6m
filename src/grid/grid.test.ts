import { describe, expect, test } from "vitest";
import { Grid } from ".";
import { AxialTuple, Hex, HexCoordinates, Orientation } from "..";

class HexWithTerrain extends Hex {
  terrain!: string;
}

describe("instantiation", () => {
  test("empty", () => {
    const grid = new Grid();
    expect(grid.size).toBe(0);
  });
  test("with hex's", () => {
    const hex1 = new Hex([0, 0]);
    const hex2 = new Hex([0, 1]);
    const grid = new Grid([hex1, hex2]);
    expect(grid.size).toBe(2);
    expect(grid.config).toBeDefined();
  });
  test("with hex's and config", () => {
    const hex1 = new Hex([0, 0], { offset: -1 });
    const hex2 = new Hex([0, 1], { offset: +1 });
    const grid = new Grid([hex1, hex2], { offset: -1 });
    expect(grid.size).toBe(2);
    expect(grid.toArray()[0].config.offset).toBe(-1);
    expect(grid.toArray()[1].config.offset).toBe(-1);
  });
  test("with extended Hex", () => {
    const hexWithTerrain = new HexWithTerrain([1, 2]);
    hexWithTerrain.terrain = "grass";
    const grid = new Grid([hexWithTerrain]);
    expect(grid.size).toBe(1);
  });
  test("with extended Hex and config", () => {
    const hexWithTerrain = new HexWithTerrain([1, 2]);
    hexWithTerrain.terrain = "grass";
    const grid = new Grid([hexWithTerrain], {
      orientation: Orientation.pointy,
      gutter: 5,
    });
    expect(grid.size).toBe(1);
  });
  test("with coordinates", () => {
    const grid = Grid.fromCoordinates({
      coords: [
        [0, 0],
        [1, 0],
      ],
    });
    expect(grid.size).toBe(2);
    expect(grid.toArray()[0]).toBeInstanceOf(Hex);
  });
  test("with coordinates and extended Hex", () => {
    const grid = Grid.fromCoordinates({
      coords: [
        [0, 0],
        [1, 0],
      ],
      hexConstructor: HexWithTerrain,
    });
    expect(grid.size).toBe(2);
    expect(grid.toArray()[0]).toBeInstanceOf(HexWithTerrain);
  });
  test("with coordinates, and config", () => {
    const grid = Grid.fromCoordinates({
      coords: [
        [0, 0],
        [1, 0],
      ],
      config: {
        offset: -1,
        orientation: Orientation.flat,
        origin: { x: 10, y: 10 },
        size: { x: 15, y: 15 },
        gutter: 10,
      },
    });
    expect(grid.size).toBe(2);
    expect(grid.toArray()[0]).toBeInstanceOf(Hex);
  });
  test("using the fromCoordinates static method with coordinates", () => {
    function* genCoords(): Generator<AxialTuple> {
      yield [0, 0];
      yield [0, 1];
    }
    const setCoords = new Set<HexCoordinates>(genCoords());
    const arrayCoords: AxialTuple[] = [
      [1, 2],
      [3, 4],
    ];

    const gridFromGenerator = Grid.fromCoordinates(genCoords());
    const gridFromArray = Grid.fromCoordinates(arrayCoords);
    const gridFromSet = Grid.fromCoordinates(setCoords);

    expect(gridFromSet.size).toBe(2);
    expect(gridFromSet.toArray()[0]).toBeInstanceOf(Hex);
    expect(gridFromArray.size).toBe(2);
    expect(gridFromArray.toArray()[0]).toBeInstanceOf(Hex);
    expect(gridFromGenerator.size).toBe(2);
    expect(gridFromGenerator.toArray()[0]).toBeInstanceOf(Hex);
  });
});
