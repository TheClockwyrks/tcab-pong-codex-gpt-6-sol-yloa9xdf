import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MATCHOVER_ITEMS,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_HH,
  OBSTACLE_HW,
  OBSTACLE_SPIN_RATE,
  OBSTACLE_SWAY_AMP,
  OBSTACLE_SWAY_PERIOD,
  OBSTACLE_W,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_H,
  PADDLE_HALF,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
  readonly theta: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;
  readonly simTime: number;
  readonly muted: boolean;
  readonly pointerStarts: Readonly<Record<number, number>>;
}
export interface CaromSnapshot extends Omit<
  CaromState,
  "ball" | "pointerStarts"
> {
  readonly version: number;
  readonly ball: (BallState & { readonly speed: number }) | null;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  setObstacleClock(s: DeepReadonly<CaromState>, t: number): CaromState;
  setObstacleClockRunning(
    s: DeepReadonly<CaromState>,
    running: boolean,
  ): CaromState;
  snapshot(s: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
}
export const BACKGROUND = "#071420";
const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));
const sign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const parked = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: sign(),
  trail: [],
});
const pose = (index: number, t: number): ObstacleState => {
  const base = OBSTACLE_CENTERS[index];
  if (!base) throw new Error(`No obstacle ${index}`);
  return {
    index,
    cx: base.x,
    cy:
      base.y +
      (index === 0 ? 1 : -1) *
        OBSTACLE_SWAY_AMP *
        Math.sin((2 * Math.PI * t) / OBSTACLE_SWAY_PERIOD),
    theta: OBSTACLE_SPIN_RATE * t,
  };
};
const initial = (muted: boolean): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: {
    left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
  },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: parked(),
  obstacles: [pose(0, 0), pose(1, 0)],
  obstacleClock: 0,
  obstacleClockRunning: true,
  simTime: 0,
  muted,
  pointerStarts: {},
});
const copy = (s: DeepReadonly<CaromState>): CaromState => ({
  ...s,
  score: { ...s.score },
  paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
  ai: { ...s.ai },
  ball: s.ball ? { ...s.ball, trail: [...s.ball.trail] } : null,
  obstacles: s.obstacles.map((o) => ({ ...o })),
  pointerStarts: { ...s.pointerStarts },
});
const resetTitle = (s: DeepReadonly<CaromState>): CaromState => ({
  ...initial(s.muted),
  titleIndex: s.titleIndex,
  menuIndex: s.titleIndex,
  simTime: s.simTime,
});
const startMatch = (s: DeepReadonly<CaromState>, mode: Mode): CaromState => ({
  ...copy(s),
  screen: "countdown",
  mode,
  resumeScreen: "playing",
  menuIndex: 0,
  score: { p1: 0, p2: 0 },
  winner: null,
  receiver: "left",
  ball: parked(),
  paddles: {
    left: { ...s.paddles.left, cy: FIELD_CY, vy: 0 },
    right: { ...s.paddles.right, cy: FIELD_CY, vy: 0 },
  },
  obstacleClock: 0,
  obstacleClockRunning: true,
  obstacles: [pose(0, 0), pose(1, 0)],
  pointerStarts: {},
});
const movePaddle = (
  p: DeepReadonly<PaddleState>,
  vy: number,
  dt: number,
): PaddleState => {
  const cy = clamp(p.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
  return {
    ...p,
    cy,
    vy: dt > 0 && cy !== p.cy + vy * dt ? (cy - p.cy) / dt : vy,
  };
};
const itemCount = (screen: Screen): number =>
  screen === "title"
    ? TITLE_ITEMS.length
    : screen === "howto"
      ? 1
      : screen === "paused"
        ? PAUSE_ITEMS.length
        : screen === "matchover"
          ? MATCHOVER_ITEMS.length
          : 0;
const menuRect = (
  s: DeepReadonly<CaromState>,
  index: number,
): { x: number; y: number; w: number; h: number } | null =>
  index >= 0 && index < itemCount(s.screen)
    ? {
        x: FIELD_CX - 185,
        y:
          (s.screen === "howto" ? 552 : s.screen === "title" ? 390 : 390) +
          index * 66,
        w: 370,
        h: 54,
      }
    : null;
const hitMenu = (s: DeepReadonly<CaromState>, x: number, y: number): number => {
  for (let i = 0; i < itemCount(s.screen); i++) {
    const r = menuRect(s, i)!;
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
  }
  return -1;
};
const requireBall = (s: DeepReadonly<CaromState>): BallState => {
  if (!s.ball) throw new Error("No ball on the playfield");
  return { ...s.ball, trail: [...s.ball.trail] };
};
const ballPose = (
  s: DeepReadonly<CaromState>,
  change: Partial<BallState>,
): CaromState => ({ ...copy(s), ball: { ...requireBall(s), ...change } });
const paddlePose = (
  s: DeepReadonly<CaromState>,
  side: Side,
  change: Partial<PaddleState>,
): CaromState => ({
  ...copy(s),
  paddles: { ...s.paddles, [side]: { ...s.paddles[side], ...change } },
});
const cue = (events: Set<string>, name: string): void => {
  events.add(name);
};

function collidePaddle(
  b: BallState,
  side: Side,
  p: PaddleState,
  events: Set<string>,
): BallState {
  const x0 = side === "left" ? P1_X0 : P2_X0,
    x1 = side === "left" ? P1_X1 : P2_X1;
  const y0 = p.cy - PADDLE_HALF,
    y1 = p.cy + PADDLE_HALF;
  if (!(
    b.x > x0 - BALL_R &&
    b.x < x1 + BALL_R &&
    b.y > y0 - BALL_R &&
    b.y < y1 + BALL_R
  ))
    return b;
  const depths = [
    b.x - (x0 - BALL_R),
    x1 + BALL_R - b.x,
    b.y - (y0 - BALL_R),
    y1 + BALL_R - b.y,
  ];
  const face = depths.indexOf(Math.min(...depths));
  if (face === 2) {
    if (b.vy > 0) {
      cue(events, CUES.wallBounce);
      return { ...b, y: y0 - BALL_R, vy: -b.vy };
    }
    return { ...b, y: y0 - BALL_R };
  }
  if (face === 3) {
    if (b.vy < 0) {
      cue(events, CUES.wallBounce);
      return { ...b, y: y1 + BALL_R, vy: -b.vy };
    }
    return { ...b, y: y1 + BALL_R };
  }
  const into = face === 0 ? b.vx > 0 : b.vx < 0;
  if (!into) return { ...b, x: face === 0 ? x0 - BALL_R : x1 + BALL_R };
  const speed = Math.min(Math.hypot(b.vx, b.vy) * SPEED_MULT, SPEED_CAP);
  const theta = clamp((b.y - p.cy) / PADDLE_HALF, -1, 1) * MAX_BOUNCE_ANGLE;
  cue(events, CUES.paddleHit);
  return {
    ...b,
    x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
    vx: (side === "left" ? 1 : -1) * speed * Math.cos(theta),
    vy: speed * Math.sin(theta),
    spin: clamp(b.spin + p.vy * SPIN_FROM_PADDLE, -SPIN_CLAMP, SPIN_CLAMP),
  };
}
function collideObstacle(
  b: BallState,
  o: ObstacleState,
  events: Set<string>,
): BallState {
  const c = Math.cos(o.theta),
    s = Math.sin(o.theta),
    dx = b.x - o.cx,
    dy = b.y - o.cy;
  const lx = dx * c + dy * s,
    ly = -dx * s + dy * c;
  const qx = clamp(lx, -OBSTACLE_HW, OBSTACLE_HW),
    qy = clamp(ly, -OBSTACLE_HH, OBSTACLE_HH);
  const ox = lx - qx,
    oy = ly - qy,
    dist = Math.hypot(ox, oy);
  if (dist >= BALL_R) return b;
  let nx: number, ny: number, push: number;
  if (dist > 0) {
    nx = ox / dist;
    ny = oy / dist;
    push = BALL_R - dist;
  } else {
    const depths = [
      lx + OBSTACLE_HW,
      OBSTACLE_HW - lx,
      ly + OBSTACLE_HH,
      OBSTACLE_HH - ly,
    ];
    const face = depths.indexOf(Math.min(...depths));
    nx = face === 0 ? -1 : face === 1 ? 1 : 0;
    ny = face === 2 ? -1 : face === 3 ? 1 : 0;
    push = BALL_R + depths[face];
  }
  const wx = nx * c - ny * s,
    wy = nx * s + ny * c;
  const dot = b.vx * wx + b.vy * wy;
  if (dot < 0) cue(events, CUES.obstacleBounce);
  return {
    ...b,
    x: b.x + wx * push,
    y: b.y + wy * push,
    vx: dot < 0 ? b.vx - 2 * dot * wx : b.vx,
    vy: dot < 0 ? b.vy - 2 * dot * wy : b.vy,
  };
}
function advanceBall(
  ball: BallState,
  paddles: CaromState["paddles"],
  obstacles: readonly ObstacleState[],
  dt: number,
  events: Set<string>,
): BallState {
  let b = ball;
  const n = Math.max(1, Math.ceil((Math.hypot(b.vx, b.vy) * dt) / MAX_SUBSTEP));
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    const speed = Math.hypot(b.vx, b.vy);
    const a = speed > 0 ? (b.spin / speed) * h : 0;
    const c = Math.cos(a),
      s = Math.sin(a);
    const vx = b.vx * c - b.vy * s,
      vy = b.vx * s + b.vy * c;
    b = {
      ...b,
      vx,
      vy,
      spin: b.spin * Math.pow(0.5, h / SPIN_HALFLIFE),
      x: b.x + vx * h,
      y: b.y + vy * h,
    };
    if (b.y - BALL_R < 0 && b.vy < 0) {
      b = { ...b, y: BALL_R, vy: -b.vy };
      cue(events, CUES.wallBounce);
    } else if (b.y + BALL_R > FIELD_H && b.vy > 0) {
      b = { ...b, y: FIELD_H - BALL_R, vy: -b.vy };
      cue(events, CUES.wallBounce);
    }
    b = collidePaddle(b, "left", paddles.left, events);
    b = collidePaddle(b, "right", paddles.right, events);
    for (const o of obstacles) b = collideObstacle(b, o, events);
  }
  return b;
}
function confirm(s: CaromState): CaromState {
  if (s.screen === "title") {
    const titleIndex = s.menuIndex;
    if (titleIndex === 2)
      return {
        ...s,
        titleIndex,
        screen: "howto",
        menuIndex: 0,
        pointerStarts: {},
      };
    return startMatch(
      { ...s, titleIndex },
      titleIndex === 0 ? "solo" : "versus",
    );
  }
  if (s.screen === "howto") return resetTitle(s);
  if (s.screen === "paused")
    return s.menuIndex === 0
      ? { ...s, screen: s.resumeScreen }
      : s.menuIndex === 1
        ? startMatch(s, s.mode)
        : resetTitle(s);
  if (s.screen === "matchover")
    return s.menuIndex === 0 ? startMatch(s, s.mode) : resetTitle(s);
  return s;
}
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    for (const name of ACTIONS)
      api.input.register(name, { keys: [...BINDINGS[name]] });
    api.audio.define(CUES.paddleHit, {
      wave: "triangle",
      freq: 420,
      freqTo: 700,
      durationMs: 85,
      gain: 0.19,
    });
    api.audio.define(CUES.wallBounce, {
      wave: "sine",
      freq: 320,
      freqTo: 220,
      durationMs: 65,
      gain: 0.12,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "square",
      freq: 260,
      freqTo: 460,
      durationMs: 75,
      gain: 0.1,
    });
    api.audio.define(CUES.score, {
      wave: "triangle",
      freq: 660,
      freqTo: 330,
      durationMs: 220,
      gain: 0.2,
    });
    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("mode", (s) => s.mode);
    api.diagnostics.register("score", (s) => `${s.score.p1} : ${s.score.p2}`);
    api.diagnostics.register("ball", (s) =>
      s.ball ? `${s.ball.x.toFixed(1)}, ${s.ball.y.toFixed(1)}` : "absent",
    );
    api.diagnostics.register("velocity", (s) =>
      s.ball ? `${s.ball.vx.toFixed(1)}, ${s.ball.vy.toFixed(1)}` : "absent",
    );
    api.diagnostics.register("speed", (s) =>
      s.ball ? Math.hypot(s.ball.vx, s.ball.vy).toFixed(1) : "absent",
    );
    api.diagnostics.register(
      "spin",
      (s) => s.ball?.spin.toFixed(1) ?? "absent",
    );
    for (const side of ["left", "right"] as const)
      api.diagnostics.register(
        side,
        (s) =>
          `${s.paddles[side].cy.toFixed(1)}, ${s.paddles[side].vy.toFixed(1)}`,
      );
    const debug: CaromDebugApi = {
      version: CAROM_DEBUG_VERSION,
      clearWorld: (s) => ({ ...copy(s), ball: null, obstacles: [] }),
      spawnBall: (s) => ({ ...copy(s), ball: parked() }),
      spawnObstacle: (s, index) => {
        const o = pose(index, s.obstacleClock);
        return {
          ...copy(s),
          obstacles: [...s.obstacles.filter((v) => v.index !== index), o].sort(
            (a, b) => a.index - b.index,
          ),
        };
      },
      reset: (s) => initial(s.muted),
      reconcile: (s) => ({
        ...copy(s),
        obstacles: s.obstacles.map((o) => pose(o.index, s.obstacleClock)),
      }),
      setScreen: (s, screen) => ({ ...copy(s), screen }),
      setMode: (s, mode) => ({ ...copy(s), mode }),
      setMenuIndex: (s, menuIndex) => ({ ...copy(s), menuIndex }),
      setTitleIndex: (s, titleIndex) => ({ ...copy(s), titleIndex }),
      setResumeScreen: (s, resumeScreen) => ({ ...copy(s), resumeScreen }),
      setScore: (s, p1, p2) => ({ ...copy(s), score: { p1, p2 } }),
      setWinner: (s, winner) => ({ ...copy(s), winner }),
      setReceiver: (s, receiver) => ({ ...copy(s), receiver }),
      setPaddleCy: (s, side, cy) => paddlePose(s, side, { cy }),
      setPaddleVy: (s, side, drivenVy) => paddlePose(s, side, { drivenVy }),
      setPaddleDriven: (s, side, driven) => paddlePose(s, side, { driven }),
      setBallPosition: (s, x, y) => ballPose(s, { x, y }),
      setBallVelocity: (s, vx, vy) => ballPose(s, { vx, vy }),
      setBallSpin: (s, spin) => ballPose(s, { spin }),
      setBallHeld: (s, held) => ballPose(s, { held }),
      setBallHoldTimer: (s, holdTimer) => ballPose(s, { holdTimer }),
      setBallServeSign: (s, serveSign) => ballPose(s, { serveSign }),
      drawBallServeSign: (s) => ballPose(s, { serveSign: sign() }),
      setAiTracking: (s, tracking) => ({
        ...copy(s),
        ai: { ...s.ai, tracking },
      }),
      setAiMovement: (s, movement) => ({
        ...copy(s),
        ai: { ...s.ai, movement },
      }),
      setMuted: (s, muted) => ({ ...copy(s), muted }),
      setObstacleClock: (s, obstacleClock) => ({
        ...copy(s),
        obstacleClock,
        obstacles: s.obstacles.map((o) => pose(o.index, obstacleClock)),
      }),
      setObstacleClockRunning: (s, obstacleClockRunning) => ({
        ...copy(s),
        obstacleClockRunning,
      }),
      snapshot: (s) => {
        const { pointerStarts: _pointerStarts, ...visible } = copy(s);
        return {
          ...visible,
          version: CAROM_DEBUG_VERSION,
          ball: s.ball
            ? {
                ...s.ball,
                trail: [...s.ball.trail],
                speed: Math.hypot(s.ball.vx, s.ball.vy),
              }
            : null,
        };
      },
      menuItemRect: menuRect,
    };
    return [initial(false), debug];
  },
  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    let s = copy(state);
    const started = s.screen;
    const input = api.input;
    const edges = Object.fromEntries(
      ACTIONS.map((a) => [a, input.pressed(a)]),
    ) as Record<(typeof ACTIONS)[number], boolean>;
    s = { ...s, simTime: s.simTime + dt };
    if (s.muted !== api.audio.muted()) api.audio.setMuted(s.muted);
    if (edges.mute) api.audio.setMuted(!api.audio.muted());
    s = { ...s, muted: api.audio.muted() };
    if (started === "countdown" || started === "playing") {
      if (edges.pause)
        s = {
          ...s,
          screen: "paused",
          resumeScreen: started,
          menuIndex: 0,
          pointerStarts: {},
        };
    } else if (started === "paused" && (edges.pause || edges.back)) {
      s = { ...s, screen: s.resumeScreen, pointerStarts: {} };
    } else if (
      (started === "howto" && edges.back) ||
      (started === "matchover" && edges.back)
    ) {
      s = resetTitle(s);
    } else if (itemCount(started) > 0) {
      const up = edges["p1-up"] || edges["p2-up"],
        down = edges["p1-down"] || edges["p2-down"];
      if (up)
        s = {
          ...s,
          menuIndex:
            (s.menuIndex + itemCount(started) - 1) % itemCount(started),
        };
      else if (down)
        s = { ...s, menuIndex: (s.menuIndex + 1) % itemCount(started) };
      else if (edges.confirm) s = confirm(s);
      if (s.screen === started) {
        const starts = { ...s.pointerStarts };
        let pointerConfirm = -1;
        for (const sample of input.pointerSamples()) {
          if (sample.button !== "primary" && sample.type !== "move") continue;
          const item = hitMenu(s, sample.x, sample.y);
          if (item >= 0) s = { ...s, menuIndex: item };
          if (sample.type === "down") starts[sample.id] = item;
          if (sample.type === "up") {
            if (starts[sample.id] === item && item >= 0) pointerConfirm = item;
            delete starts[sample.id];
          }
        }
        s = { ...s, pointerStarts: starts };
        if (!edges.confirm && pointerConfirm >= 0)
          s = confirm({ ...s, menuIndex: pointerConfirm });
      }
    }
    if (s.screen === "countdown" || s.screen === "playing") {
      const left = s.paddles.left;
      const right = s.paddles.right;
      const leftVy = left.driven
        ? left.drivenVy
        : ((input.value("p1-down") ||
          (s.mode === "solo" && input.value("p2-down"))
            ? 1
            : 0) -
            (input.value("p1-up") || (s.mode === "solo" && input.value("p2-up"))
              ? 1
              : 0)) *
          PADDLE_SPEED;
      let rightVy = 0;
      if (right.driven) rightVy = right.drivenVy;
      else if (s.mode === "versus")
        rightVy =
          (input.value("p2-down") - input.value("p2-up")) * PADDLE_SPEED;
      else if (s.ai.movement) {
        const defend =
          s.ai.tracking &&
          s.screen === "playing" &&
          s.ball !== null &&
          s.ball.vx > 0;
        const target = defend ? s.ball!.y - s.ball!.vy * AI_REACT : AI_HOME_Y;
        const diff = target - right.cy;
        const deadzone = defend ? AI_DEADZONE : AI_HOME_DEADZONE;
        rightVy =
          Math.abs(diff) <= deadzone || dt <= 0
            ? 0
            : Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff) / dt);
      }
      s = {
        ...s,
        paddles: {
          left: movePaddle(left, leftVy, dt),
          right: movePaddle(right, rightVy, dt),
        },
      };
      if (s.ball) {
        let b = s.ball;
        const events = new Set<string>();
        if (s.screen === "countdown") {
          const holdTimer = b.holdTimer - dt;
          if (holdTimer <= 0) {
            const dir = s.receiver === "left" ? -1 : 1;
            b = {
              ...b,
              held: false,
              holdTimer: 0,
              vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
              vy: b.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
              trail: [],
            };
            s = { ...s, screen: "playing" };
          } else b = { ...b, holdTimer };
        } else if (!b.held) {
          b = advanceBall(b, s.paddles, s.obstacles, dt, events);
          const scorer =
            b.x - BALL_R > FIELD_W ? "left" : b.x + BALL_R < 0 ? "right" : null;
          if (scorer) {
            const score = {
              ...s.score,
              [scorer === "left" ? "p1" : "p2"]:
                s.score[scorer === "left" ? "p1" : "p2"] + 1,
            };
            const lead =
              scorer === "left" ? score.p1 - score.p2 : score.p2 - score.p1;
            cue(events, CUES.score);
            s = { ...s, score, receiver: scorer === "left" ? "right" : "left" };
            if (
              score[scorer === "left" ? "p1" : "p2"] >= WIN_SCORE &&
              lead >= WIN_LEAD
            )
              s = { ...s, screen: "matchover", winner: scorer, menuIndex: 0 };
            else {
              s = { ...s, screen: "countdown" };
              b = parked();
            }
          }
        }
        if (s.screen === "countdown" || s.screen === "playing")
          b = {
            ...b,
            trail: [
              ...b.trail.filter((p) => s.simTime - p.t <= TRAIL_TIME),
              { x: b.x, y: b.y, t: s.simTime },
            ],
          };
        s = { ...s, ball: b };
        for (const name of events) api.audio.play(name);
      }
      if (s.obstacleClockRunning) {
        const obstacleClock = s.obstacleClock + dt;
        s = {
          ...s,
          obstacleClock,
          obstacles: s.obstacles.map((o) => pose(o.index, obstacleClock)),
        };
      }
    }
    return s;
  },
  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    const ctx = api.ctx;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    const grid = 80;
    ctx.strokeStyle = "#153240";
    ctx.lineWidth = 1;
    for (let x = 0; x <= FIELD_W; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, FIELD_H);
      ctx.stroke();
    }
    for (let y = 0; y <= FIELD_H; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(FIELD_W, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#2b6270";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 16]);
    ctx.beginPath();
    ctx.moveTo(NET_X, 18);
    ctx.lineTo(NET_X, FIELD_H - 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#295363";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, FIELD_W - 48, FIELD_H - 48);
    const body = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      glow: string,
    ): void => {
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = glow;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, Math.min(w / 2, 12));
      ctx.fill();
      ctx.restore();
    };
    for (const o of state.obstacles) {
      ctx.save();
      ctx.translate(o.cx, o.cy);
      ctx.rotate(o.theta);
      body(
        -OBSTACLE_W / 2,
        -OBSTACLE_H / 2,
        OBSTACLE_W,
        OBSTACLE_H,
        "#e6ad55",
        "#e6ad55",
      );
      ctx.restore();
    }
    body(
      P1_X0,
      state.paddles.left.cy - PADDLE_HALF,
      PADDLE_W,
      PADDLE_H,
      "#58e5de",
      "#58e5de",
    );
    body(
      P2_X0,
      state.paddles.right.cy - PADDLE_HALF,
      PADDLE_W,
      PADDLE_H,
      "#ef7198",
      "#ef7198",
    );
    if (state.ball) {
      const b = state.ball;
      if (b.trail.length > 1) {
        ctx.lineCap = "round";
        for (let i = 1; i < b.trail.length; i++) {
          const p = b.trail[i - 1],
            q = b.trail[i];
          ctx.strokeStyle = `rgba(245,246,222,${(0.5 * i) / b.trail.length})`;
          ctx.lineWidth = (BALL_R * 1.5 * i) / b.trail.length;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.save();
      ctx.shadowBlur = 28;
      ctx.shadowColor = "#fff4bb";
      ctx.fillStyle = "#fff4d7";
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const text = (
      value: string,
      x: number,
      y: number,
      size: number,
      color = "#edf7f4",
      align: CanvasTextAlign = "center",
      weight = "700",
    ): void => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px system-ui, sans-serif`;
      ctx.textAlign = align;
      ctx.fillText(value, x, y);
    };
    if (state.screen !== "title" && state.screen !== "howto") {
      text(String(state.score.p1), FIELD_CX - 90, 96, 55, "#58e5de");
      text(String(state.score.p2), FIELD_CX + 90, 96, 55, "#ef7198");
      text(
        state.mode === "solo" ? "SOLO // VS AI" : "VERSUS // LOCAL DUEL",
        FIELD_CX,
        34,
        15,
        "#7ea8ad",
        "center",
        "600",
      );
    }
    if (state.screen === "countdown") {
      text("NEXT SERVE", FIELD_CX, 280, 20, "#bcd2cd");
      text(
        String(Math.max(1, Math.ceil(state.ball?.holdTimer ?? 0))),
        FIELD_CX,
        340,
        64,
        "#fff4d7",
      );
    }
    if (
      state.screen === "title" ||
      state.screen === "howto" ||
      state.screen === "paused" ||
      state.screen === "matchover"
    ) {
      ctx.fillStyle = "rgba(3, 13, 22, 0.76)";
      ctx.fillRect(0, 0, FIELD_W, FIELD_H);
      if (state.screen === "title") {
        text(
          "PADDLE DUEL // BANK THE ANGLE",
          FIELD_CX,
          178,
          18,
          "#e6ad55",
          "center",
          "600",
        );
        text(TITLE_TEXT, FIELD_CX, 298, 110, "#f0f5e8", "center", "900");
        text(
          "Bend the rally. Own the rebound.",
          FIELD_CX,
          343,
          20,
          "#92b8bc",
          "center",
          "500",
        );
      }
      if (state.screen === "howto") {
        text("HOW TO PLAY", FIELD_CX, 138, 52);
        text("W / S   •   left paddle", FIELD_CX, 229, 24, "#58e5de");
        text(
          "↑ / ↓   •   right paddle in Versus",
          FIELD_CX,
          275,
          24,
          "#ef7198",
        );
        text(
          "Move as you strike to bend the ball's flight.",
          FIELD_CX,
          347,
          23,
        );
        text("Bank shots off the moving golden obstacles.", FIELD_CX, 385, 23);
        text(
          "First to 11, win by 2.  P or Esc pauses.  M mutes.",
          FIELD_CX,
          465,
          19,
          "#9bb5bb",
        );
      }
      if (state.screen === "paused") {
        text("PAUSED", FIELD_CX, 280, 68);
        text(
          "Take a breath. The angle can wait.",
          FIELD_CX,
          335,
          19,
          "#92b8bc",
        );
      }
      if (state.screen === "matchover") {
        text(
          state.winner === "left" ? "LEFT WINS" : "RIGHT WINS",
          FIELD_CX,
          258,
          70,
          state.winner === "left" ? "#58e5de" : "#ef7198",
        );
        text(`${state.score.p1}  :  ${state.score.p2}`, FIELD_CX, 330, 36);
      }
      const items =
        state.screen === "title"
          ? TITLE_ITEMS
          : state.screen === "paused"
            ? PAUSE_ITEMS
            : state.screen === "matchover"
              ? MATCHOVER_ITEMS
              : ["BACK TO MENU"];
      items.forEach((item, i) => {
        const r = menuRect(state, i)!;
        const selected = state.menuIndex === i;
        ctx.fillStyle = selected ? "#f0f5e8" : "#12303e";
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 11);
        ctx.fill();
        text(item, FIELD_CX, r.y + 36, 21, selected ? "#071420" : "#a6c2c4");
      });
    }
    if (state.screen === "playing" || state.screen === "countdown")
      text(
        "P / ESC  PAUSE       M  MUTE",
        FIELD_CX,
        FIELD_H - 18,
        13,
        "#54808a",
        "center",
        "500",
      );
  },
};
