import test from "node:test";
import assert from "node:assert/strict";
import { durationForDescent, sampleDescent } from "../lib/descent.ts";

test("scoring drops last long enough, increase with distance, and remain bounded", () => {
  assert.equal(durationForDescent(100), 1850);
  assert.equal(durationForDescent(1000), 2500);
  let previous = 0;
  for (const distance of [0.001, 1, 50, 100, 250, 500, 750, 1000, 100000]) {
    const duration = durationForDescent(distance);
    assert.ok(Number.isInteger(duration));
    assert.ok(duration >= 1850 && duration <= 2500);
    assert.ok(duration >= previous);
    previous = duration;
  }
  for (const distance of [0, -1, NaN, Infinity, -Infinity]) {
    assert.equal(durationForDescent(distance), 0);
  }
});

test("timeline clamps invalid elapsed time and has exact resting endpoints", () => {
  const start = { progress: 0, speed: 0, phase: "charge" };
  const end = { progress: 1, speed: 0, phase: "landed" };
  for (const elapsed of [0, -0.1, -Infinity, NaN]) {
    assert.deepEqual(sampleDescent(elapsed), start);
  }
  for (const elapsed of [1, 1.1, Infinity]) {
    assert.deepEqual(sampleDescent(elapsed), end);
  }
});

test("all samples advance monotonically without depth overshoot or invalid speed", () => {
  let previous = 0;
  for (let tick = 0; tick <= 10000; tick += 1) {
    const sample = sampleDescent(tick / 10000);
    assert.ok(
      Number.isFinite(sample.progress) && Number.isFinite(sample.speed),
    );
    assert.ok(
      sample.progress >= previous,
      `backwards movement at tick ${tick}`,
    );
    assert.ok(sample.progress >= 0 && sample.progress <= 1);
    assert.ok(sample.speed >= 0 && sample.speed <= 1);
    previous = sample.progress;
  }
});

test("a small charge leads into sustained acceleration and a soft braking phase", () => {
  assert.equal(sampleDescent(0.099).phase, "charge");
  assert.equal(sampleDescent(0.1).phase, "dive");
  assert.equal(sampleDescent(0.779).phase, "dive");
  assert.equal(sampleDescent(0.78).phase, "brake");
  assert.ok(sampleDescent(0.1).progress < 0.03);
  assert.ok(sampleDescent(0.78).progress - sampleDescent(0.1).progress > 0.75);
  const acceleration = [0.02, 0.07, 0.1, 0.2, 0.3, 0.4].map(
    (elapsed) => sampleDescent(elapsed).speed,
  );
  for (let index = 1; index < acceleration.length; index += 1) {
    assert.ok(acceleration[index] > acceleration[index - 1]);
  }
  for (const elapsed of [0.4, 0.6, 0.7]) {
    assert.equal(sampleDescent(elapsed).speed, 1);
  }
  const braking = [0.78, 0.85, 0.9, 0.98, 0.999, 1].map(
    (elapsed) => sampleDescent(elapsed).speed,
  );
  for (let index = 1; index < braking.length; index += 1) {
    assert.ok(braking[index] < braking[index - 1]);
  }
  assert.ok(sampleDescent(0.999).speed < 0.001);
});

test("phase boundaries join without a position or velocity jump", () => {
  for (const boundary of [0.1, 0.34, 0.78, 1]) {
    const before = sampleDescent(boundary - 1e-7);
    const after = sampleDescent(boundary + 1e-7);
    assert.ok(Math.abs(after.progress - before.progress) < 1e-6);
    assert.ok(Math.abs(after.speed - before.speed) < 1e-5);
  }
});

test("reported speed follows camera movement rather than an unrelated effect curve", () => {
  const step = 1 / 10000;
  let totalArea = 0;
  const areas = [0];
  for (let tick = 1; tick <= 10000; tick += 1) {
    totalArea +=
      (step *
        (sampleDescent((tick - 1) * step).speed +
          sampleDescent(tick * step).speed)) /
      2;
    areas.push(totalArea);
  }
  for (const tick of [250, 1000, 2500, 5000, 7800, 9000, 9900]) {
    assert.ok(
      Math.abs(areas[tick] / totalArea - sampleDescent(tick * step).progress) <
        1e-6,
    );
  }
});
