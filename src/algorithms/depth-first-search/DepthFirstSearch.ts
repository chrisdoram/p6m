// Modified version of dfs from https://github.com/loiane/javascript-datastructures-algorithms/blob/main/src/ts/algorithms/graph/depth-first-search.ts
// original author : https://github.com/loiane
// modified by : https://github.com/chrisdoram

import { Hex } from "../..";

enum State {
  NOT_VISITED = 0,
  VISITED = 1,
  FINISHED = 2,
}

type Callback = (u: Hex) => void;

function initializeColor<T extends Hex>(vertices: T[]) {
  const color: any = {};
  for (let i = 0; i < vertices.length; i++) {
    color[vertices[i].toString()] = State.NOT_VISITED;
  }
  return color;
}

const depthFirstSearchVisit = (u: Hex, color: any, callback: Callback) => {
  color[u.toString()] = "grey";
  if (callback) {
    callback(u);
  }
  // console.log('Discovered ' + u);
  const neighbors = u.neighbors;
  for (let i = 0; i < neighbors.length; i++) {
    const w = neighbors[i];
    if (color[w.toString()] === State.NOT_VISITED) {
      depthFirstSearchVisit(w, color, callback);
    }
  }
  color[u.toString()] = State.FINISHED;
  // console.log('explored ' + u);
};

export function depthFirstSearch<T extends Hex>(
  vertices: T[],
  callback: Callback
) {
  const color = initializeColor(vertices);

  for (let i = 0; i < vertices.length; i++) {
    if (color[vertices[i].toString()] === State.NOT_VISITED) {
      depthFirstSearchVisit(vertices[i], color, callback);
    }
  }
}

const DFSVisit = (
  u: Hex,
  color: any,
  d: any,
  f: any,
  p: any,
  time: any,
  callback: Callback
) => {
  // console.log('discovered ' + u);
  color[u.toString()] = State.VISITED;
  d[u.toString()] = ++time.count;
  const neighbors = u.neighbors;
  for (let i = 0; i < neighbors.length; i++) {
    const w = neighbors[i];
    if (color[w.toString()] === State.NOT_VISITED) {
      p[w.toString()] = u;
      DFSVisit(w, color, d, f, p, time, callback);
    }
  }
  color[u.toString()] = State.FINISHED;
  f[u.toString()] = ++time.count;
  // console.log('explored ' + u);
};

export function DFS<T extends Hex>(vertices: T[], callback: Callback) {
  const color = initializeColor(vertices);
  // discovery
  const d: any = {};
  // finished
  const f: any = {};
  // predecessors
  const p: any = {};
  const time = { count: 0 };

  // initialize output for each vertex
  for (let i = 0; i < vertices.length; i++) {
    let hash = vertices[i].toString();
    f[hash] = 0;
    d[hash] = 0;
    p[hash] = null;
  }

  // loop over all vertices visiting them if they have not been visited yet
  for (let i = 0; i < vertices.length; i++) {
    if (color[vertices[i].toString()] === State.NOT_VISITED) {
      DFSVisit(vertices[i], color, d, f, p, time, callback);
    }
  }

  return {
    discovery: d,
    finished: f,
    predecessors: p,
  };
}
