export type DescentPhase = "charge" | "dive" | "brake" | "landed";

export type DescentSample = {
  /** Fraction of the requested distance travelled, without overshoot. */
  progress: number;
  /** Camera velocity relative to its peak, useful for wake and particle effects. */
  speed: number;
  phase: DescentPhase;
};

const CHARGE_END = 0.1;
const ACCELERATION_END = 0.34;
const BRAKE_START = 0.78;
const CHARGE_SPEED = 0.12;
const ACCELERATION_DURATION = ACCELERATION_END - CHARGE_END;
const BRAKE_DURATION = 1 - BRAKE_START;
const CHARGE_DISTANCE = (CHARGE_END * CHARGE_SPEED) / 2;
const ACCELERATION_DISTANCE = (ACCELERATION_DURATION * (CHARGE_SPEED + 1)) / 2;
const CRUISE_DISTANCE = BRAKE_START - ACCELERATION_END;
const TOTAL_DISTANCE =
  CHARGE_DISTANCE +
  ACCELERATION_DISTANCE +
  CRUISE_DISTANCE +
  BRAKE_DURATION / 2;

/** Even the smallest scoring drop gets a full charge, dive, and landing. */
export function durationForDescent(distance: number): number {
  if (!Number.isFinite(distance) || distance <= 0) return 0;
  const distanceScale = Math.min(1, Math.max(0, (distance - 100) / 900));
  return Math.round(1850 + distanceScale * 650);
}

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

// Integral of smoothStep from zero to value. Integrating velocity keeps the
// camera position continuous and makes visual speed follow the actual descent.
function smoothStepArea(value: number): number {
  return value * value * value * (1 - value / 2);
}

/** Sample elapsed time as a fraction of durationForDescent's result. */
export function sampleDescent(elapsedProgress: number): DescentSample {
  const elapsed = Number.isNaN(elapsedProgress)
    ? 0
    : Math.min(1, Math.max(0, elapsedProgress));
  if (elapsed <= 0) return { progress: 0, speed: 0, phase: "charge" };
  if (elapsed >= 1) return { progress: 1, speed: 0, phase: "landed" };

  let distance: number;
  let speed: number;
  let phase: DescentPhase;
  if (elapsed < CHARGE_END) {
    const local = elapsed / CHARGE_END;
    distance = CHARGE_SPEED * CHARGE_END * smoothStepArea(local);
    speed = CHARGE_SPEED * smoothStep(local);
    phase = "charge";
  } else if (elapsed < ACCELERATION_END) {
    const local = (elapsed - CHARGE_END) / ACCELERATION_DURATION;
    distance =
      CHARGE_DISTANCE +
      ACCELERATION_DURATION *
        (CHARGE_SPEED * local + (1 - CHARGE_SPEED) * smoothStepArea(local));
    speed = CHARGE_SPEED + (1 - CHARGE_SPEED) * smoothStep(local);
    phase = "dive";
  } else if (elapsed < BRAKE_START) {
    distance =
      CHARGE_DISTANCE + ACCELERATION_DISTANCE + elapsed - ACCELERATION_END;
    speed = 1;
    phase = "dive";
  } else {
    const local = (elapsed - BRAKE_START) / BRAKE_DURATION;
    distance =
      CHARGE_DISTANCE +
      ACCELERATION_DISTANCE +
      CRUISE_DISTANCE +
      BRAKE_DURATION * (local - smoothStepArea(local));
    speed = 1 - smoothStep(local);
    phase = "brake";
  }

  return {
    progress: Math.min(1, Math.max(0, distance / TOTAL_DISTANCE)),
    speed: Math.min(1, Math.max(0, speed)),
    phase,
  };
}
