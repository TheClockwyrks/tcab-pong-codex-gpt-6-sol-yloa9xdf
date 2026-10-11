import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import {
  BALL_R,
  FIELD_CX,
  FIELD_CY,
  HOLD_TIME,
  P1_X1,
  SERVE_SPEED,
  WIN_SCORE,
} from "./constants";
import { BACKGROUND, game } from "./game";

async function setup(stepMs = 10) {
  const events = new EventTarget();
  const engine = createEngine({
    canvas: createCanvas(1280, 720) as unknown as HTMLCanvasElement,
    width: 1280,
    height: 720,
    game,
    background: BACKGROUND,
    clock: new ConstantClock(stepMs),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => events,
    },
  });
  await engine.initialize();
  return engine;
}

describe("Carom simulation", () => {
  it("starts with a complete title world and serves toward the receiver", async () => {
    const e = await setup();
    const d = e.debug;
    expect(d.snapshot(e.state).ball).toMatchObject({
      x: FIELD_CX,
      y: FIELD_CY,
      held: true,
      holdTimer: HOLD_TIME,
    });
    e.apply((s) => d.setScreen(s, "countdown"));
    e.apply((s) => d.setBallServeSign(s, -1));
    await e.advance(100);
    const snap = d.snapshot(e.state);
    expect(snap.screen).toBe("playing");
    expect(snap.ball?.vx).toBeCloseTo(
      -SERVE_SPEED * Math.cos((12 * Math.PI) / 180),
    );
    expect(snap.ball?.vy).toBeLessThan(0);
    expect(snap.ball?.trail.length).toBe(1);
    e.destroy();
  });

  it("driven paddle movement adds spin at contact", async () => {
    const e = await setup();
    const d = e.debug;
    e.apply((s) => d.setScreen(s, "playing"));
    e.apply((s) => d.clearWorld(s));
    e.apply((s) => d.spawnBall(s));
    e.apply((s) => d.setBallHeld(s, false));
    e.apply((s) => d.setBallPosition(s, P1_X1 + BALL_R + 3, FIELD_CY));
    e.apply((s) => d.setBallVelocity(s, -520, 0));
    e.apply((s) => d.setPaddleDriven(s, "left", true));
    e.apply((s) => d.setPaddleVy(s, "left", 300));
    await e.advance(1);
    expect(d.snapshot(e.state).ball?.vx).toBeGreaterThan(0);
    expect(d.snapshot(e.state).ball?.spin).toBeGreaterThan(0);
    expect(d.snapshot(e.state).paddles.left.vy).toBe(300);
    e.destroy();
  });

  it("scores on a passed goal, parks, and obeys win by two", async () => {
    const e = await setup();
    const d = e.debug;
    e.apply((s) => d.setScreen(s, "playing"));
    e.apply((s) => d.setScore(s, WIN_SCORE - 1, WIN_SCORE - 1));
    e.apply((s) => d.clearWorld(s));
    e.apply((s) => d.spawnBall(s));
    e.apply((s) => d.setBallHeld(s, false));
    e.apply((s) => d.setBallPosition(s, 1290, 360));
    e.apply((s) => d.setBallVelocity(s, 400, 0));
    await e.advance(1);
    expect(d.snapshot(e.state)).toMatchObject({
      screen: "countdown",
      score: { p1: 11, p2: 10 },
      receiver: "right",
    });
    e.apply((s) => d.setScreen(s, "playing"));
    e.apply((s) => d.setBallHeld(s, false));
    e.apply((s) => d.setBallPosition(s, 1290, 360));
    e.apply((s) => d.setBallVelocity(s, 400, 0));
    await e.advance(1);
    expect(d.snapshot(e.state)).toMatchObject({
      screen: "matchover",
      winner: "left",
      score: { p1: 12, p2: 10 },
    });
    e.destroy();
  });

  it("poses rotating obstacles from their clock and freezes on pause", async () => {
    const e = await setup();
    const d = e.debug;
    e.apply((s) => d.setObstacleClock(s, 0.9));
    expect(d.snapshot(e.state).obstacles[0].cy).toBeCloseTo(300);
    expect(d.snapshot(e.state).obstacles[0].theta).toBeCloseTo(
      (0.9 * Math.PI) / 3,
    );
    e.apply((s) => d.setScreen(s, "paused"));
    const before = d.snapshot(e.state);
    await e.advance(12);
    expect(d.snapshot(e.state).obstacleClock).toBe(before.obstacleClock);
    expect(d.snapshot(e.state).simTime).toBeGreaterThan(before.simTime);
    e.destroy();
  });

  it("reflects at the wall and keeps its speed", async () => {
    const e = await setup();
    const d = e.debug;
    e.apply((s) => d.setScreen(s, "playing"));
    e.apply((s) => d.clearWorld(s));
    e.apply((s) => d.spawnBall(s));
    e.apply((s) => d.setBallHeld(s, false));
    e.apply((s) => d.setBallPosition(s, FIELD_CX, BALL_R + 1));
    e.apply((s) => d.setBallVelocity(s, 200, -300));
    await e.advance(1);
    const ball = d.snapshot(e.state).ball;
    expect(ball?.y).toBe(BALL_R);
    expect(ball?.vy).toBe(300);
    expect(ball?.speed).toBeCloseTo(Math.hypot(200, 300));
    e.destroy();
  });

  it("reflects from a tilted obstacle and preserves spin", async () => {
    const e = await setup();
    const d = e.debug;
    e.apply((s) => d.setScreen(s, "playing"));
    e.apply((s) => d.clearWorld(s));
    e.apply((s) => d.spawnObstacle(s, 0));
    e.apply((s) => d.setObstacleClock(s, 0.45));
    e.apply((s) => d.setObstacleClockRunning(s, false));
    e.apply((s) => d.spawnBall(s));
    e.apply((s) => d.setBallHeld(s, false));
    const o = d.snapshot(e.state).obstacles[0];
    e.apply((s) => d.setBallPosition(s, o.cx - 15, o.cy));
    e.apply((s) => d.setBallVelocity(s, 500, 0));
    e.apply((s) => d.setBallSpin(s, 200));
    await e.advance(1);
    const ball = d.snapshot(e.state).ball;
    expect(ball?.vx).toBeLessThan(0);
    expect(ball?.vy).not.toBe(0);
    expect(ball?.speed).toBeCloseTo(500, 0);
    expect(ball?.spin).toBeGreaterThan(0);
    e.destroy();
  });
});
