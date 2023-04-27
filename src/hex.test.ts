import { describe, expect, test } from "vitest";
import { Cube, Hex, flatDirection, pointyDirection } from ".";

describe("instantiation", () => {
  test("with Cube coordinates", () => {
    expect(new Hex({ q: 1, r: 2, s: -3 })).toContain<Cube>({
      q: 1,
      r: 2,
      s: -3,
    });
  });

  test("with Axial (partial) coordinates", () => {
    expect(new Hex({ q: 2, r: -4 })).toContain<Cube>({ q: 2, r: -4, s: 2 });
    expect(new Hex({ q: 2, s: 2 })).toContain<Cube>({ q: 2, r: -4, s: 2 });
    expect(new Hex({ r: -4, s: 2 })).toContain<Cube>({ q: 2, r: -4, s: 2 });
  });

  test("with offset coordinates", () => {
    expect(new Hex({ row: 1, col: 2 }, { offset: +1 })).toContain({
      q: 1,
      r: 1,
      s: -2,
    });
    expect(new Hex({ row: 1, col: 2 }, { offset: -1 })).toContain<Cube>({
      q: 2,
      r: 1,
      s: -3,
    });
    expect(
      new Hex({ row: 1, col: 1 }, { offset: +1, orientation: "FLAT" })
    ).toContain<Cube>({
      q: 1,
      r: 0,
      s: -1,
    });
    expect(
      new Hex({ row: 1, col: 1 }, { offset: -1, orientation: "FLAT" })
    ).toContain<Cube>({
      q: 1,
      r: 1,
      s: -2,
    });
  });

  test("cannot instantiate with invalid coordinates", () => {
    expect(() => new Hex({ q: 1, r: 1, s: 1 })).toThrow(
      RangeError("Hex(1, 1, 1) invalid: does not zero-sum")
    );
  });
});

describe("coordinate properties", () => {
  const hex = new Hex({ q: 1, r: 1 });
  test("coordinate properties on hex", () => {
    expect(hex).toContain({
      row: 1,
      col: 2,
      q: 1,
      r: 1,
      s: -2,
    });
  });
  test("config property", () => {
    expect(hex.config).toContain({ offset: 1, orientation: "POINTY" });
  });
});

describe("transform methods", () => {
  const hex = new Hex({ q: 1, r: 1 });
  const other = new Hex({ q: 1, r: -1 });
  test("toString()", () => {
    expect(hex.toString()).toBe("_Hex(1,1,-2)");
  });
  test("equals()", () => {
    expect(hex.equals(hex)).toBe(true);
    expect(hex.equals(other)).toBe(false);
  });
  test("add()", () => {
    expect(hex.add(other)).toContain({ q: 2, r: 0, s: -2 });
  });
  test("subtract()", () => {
    expect(hex.subtract(other)).toContain({ q: 0, r: 2, s: -2 });
  });
  test("scale()", () => {
    expect(hex.scale(2)).toContain({ q: 2, r: 2, s: -4 });
  });
  test("rotateLeft()", () => {
    expect(hex.rotateLeft().rotateLeft()).toContain({ q: 1, r: -2, s: 1 });
  });
  test("rotateRight()", () => {
    expect(hex.rotateRight().rotateRight()).toContain({ q: -2, r: 1, s: 1 });
  });
});

describe("Neighbors", () => {
  const pHex = new Hex({ q: 1, r: 1 });
  const fHex = new Hex({ q: 1, r: 1 }, { orientation: "FLAT" });
  test("neighbor() POINTY orientation", () => {
    expect(pHex.neighbor(0)).toContain({ q: 2, r: 1, s: -3 });
    expect(pHex.neighbor(pointyDirection.E)).toContain({ q: 2, r: 1, s: -3 });
    expect(pHex.neighbor(3)).toContain({ q: 0, r: 1, s: -1 });
    expect(pHex.neighbor(pointyDirection.NW)).toContain({ q: 1, r: 0, s: -1 });
  });
  test("neighbor() FLAT orientation", () => {
    expect(fHex.neighbor(0)).toContain({ q: 2, r: 1, s: -3 });
    expect(fHex.neighbor(flatDirection.SE)).toContain({ q: 2, r: 1, s: -3 });
    expect(fHex.neighbor(3)).toContain({ q: 0, r: 1, s: -1 });
    expect(fHex.neighbor(flatDirection.N)).toContain({ q: 1, r: 0, s: -1 });
  });
  test("neighbors property", () => {
    expect(pHex.neighbors).toHaveLength(6);
    expect(pHex.neighbors[0]).toContain({ q: 2, r: 1 });
    expect(pHex.neighbors[1]).toContain({ q: 1, r: 2 });
    expect(pHex.neighbors[2]).toContain({ q: 0, r: 2 });
    expect(pHex.neighbors[3]).toContain({ q: 0, r: 1 });
    expect(pHex.neighbors[4]).toContain({ q: 1, r: 0 });
    expect(pHex.neighbors[5]).toContain({ q: 2, r: 0 });
  });
  test("cannot call neighbor() with invalid input", () => {
    // @ts-expect-error invalid input
    expect(() => pHex.neighbor(10)).toThrow(
      Error("Direction must be between 0 (East) and 5 (North East)")
    );
  });
});
