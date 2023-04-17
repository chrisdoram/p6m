import { Hex } from "./hex";

/**
 * Linear interpolation between this Hex and b with step size t.
 * @param {Hex} a start Hex
 * @param {Hex} b end Hex
 * @param {number} t step
 * @returns {Hex}
 */
export function lerp(a: Hex, b: Hex, t: number) {
  const _lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
  // t = 1.0/N * i
  // where N is the int hex distance between the endpoints
  // i is the current hex being sampled
  return new Hex({ q: _lerp(a.q, b.q, t), r: _lerp(a.r, b.r, t) });
}

/**
 * Returns an array of Hex's between a and b.
 * @param {Hex} a source Hex of the line.
 * @param {Hex} b target Hex of the line.
 * @returns {Hex[]}
 */
export function lineDraw(a: Hex, b: Hex) {
  let N = a.distance(b);
  var aNudge = new Hex({
    q: a.q + 1e-6,
    r: a.r + 1e-6,
    s: a.s - 2e-6,
  });
  var bNudge = new Hex({ q: b.q + 1e-6, r: b.r + 1e-6, s: b.s - 2e-6 });
  let results: Hex[] = [];
  for (let i = 0; i <= N; i++) {
    // Math.max there to handle 0 length line case (A == B)
    results.push(lerp(aNudge, bNudge, (1.0 / Math.max(N, 1)) * i).round());
  }
  return results;
}
