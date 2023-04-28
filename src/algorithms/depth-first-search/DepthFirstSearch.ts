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

function initializeState<T extends Hex>(vertices: T[]) {
  const state: any = {};
  for (let i = 0; i < vertices.length; i++) {
    state[vertices[i].toString()] = State.NOT_VISITED;
  }
  return state;
}

const depthFirstSearchVisit = (u: Hex, state: any, callback: Callback) => {
  state[u.toString()] = State.VISITED;
  if (callback) {
    callback(u);
  }
  // console.log('Discovered ' + u);
  const neighbors = u.neighbors;
  for (let i = 0; i < neighbors.length; i++) {
    const w = neighbors[i];
    if (state[w.toString()] === State.NOT_VISITED) {
      depthFirstSearchVisit(w, state, callback);
    }
  }
  state[u.toString()] = State.FINISHED;
  // console.log('explored ' + u);
};

export function depthFirstSearch<T extends Hex>(
  vertices: T[],
  callback: Callback
) {
  const state = initializeState(vertices);

  for (let i = 0; i < vertices.length; i++) {
    if (state[vertices[i].toString()] === State.NOT_VISITED) {
      depthFirstSearchVisit(vertices[i], state, callback);
    }
  }
}

const DFSVisit = (
  u: Hex,
  state: any,
  d: any,
  f: any,
  p: any,
  time: any,
  callback: Callback
) => {
  // console.log('discovered ' + u);
  state[u.toString()] = State.VISITED;
  d[u.toString()] = ++time.count;
  const neighbors = u.neighbors;
  for (let i = 0; i < neighbors.length; i++) {
    const w = neighbors[i];
    if (state[w.toString()] === State.NOT_VISITED) {
      p[w.toString()] = u;
      DFSVisit(w, state, d, f, p, time, callback);
    }
  }
  state[u.toString()] = State.FINISHED;
  f[u.toString()] = ++time.count;
  // console.log('explored ' + u);
};

export function DFS<T extends Hex>(vertices: T[], callback: Callback) {
  const state = initializeState(vertices);
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
    if (state[vertices[i].toString()] === State.NOT_VISITED) {
      DFSVisit(vertices[i], state, d, f, p, time, callback);
    }
  }

  return {
    discovery: d,
    finished: f,
    predecessors: p,
  };
}
