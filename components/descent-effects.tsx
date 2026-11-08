import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./descent-effects.css";

export type DescentEffectsProps = {
  active: boolean;
  reducedMotion: boolean;
  /** Strength of this answer's dive, from 0 to 1. */
  intensity: number;
  /** Normalized camera progress; this component never starts its own frame loop. */
  progress: number;
  duration: number;
  /** A stable, unique key for the current answer/descent. */
  eventKey: string;
};

type DescentStyle = CSSProperties &
  Record<`--descent-${string}`, string | number>;

const SETTLE_DURATION = 620;
const TRACK_COUNT = 24;

function clamp(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

function smoothstep(from: number, to: number, value: number): number {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}

function sequence(key: string): () => number {
  let seed = 2166136261;
  for (const character of key) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return () => {
    seed += 0x6d2b79f5;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A foreground water layer. Mount inside the ocean scene, outside its camera. */
export const DescentEffects = memo(function DescentEffects({
  active,
  reducedMotion,
  intensity,
  progress,
  duration,
  eventKey,
}: DescentEffectsProps) {
  const strength = clamp(intensity);
  const position = clamp(progress);
  const milliseconds = Number.isFinite(duration)
    ? Math.min(8000, Math.max(300, duration))
    : 1800;
  const [settleKey, setSettleKey] = useState<string | null>(null);
  const previous = useRef({ active: false, key: eventKey });

  useEffect(() => {
    const stopped =
      previous.current.active &&
      previous.current.key === eventKey &&
      !active &&
      !reducedMotion;
    previous.current = { active: active && !reducedMotion, key: eventKey };
    setSettleKey(stopped ? eventKey : null);
    if (!stopped) return;
    const timeout = window.setTimeout(
      () => setSettleKey(null),
      SETTLE_DURATION,
    );
    return () => window.clearTimeout(timeout);
  }, [active, eventKey, reducedMotion]);

  const tracks = useMemo(() => {
    if (reducedMotion) return [];
    const random = sequence(eventKey);
    return Array.from({ length: TRACK_COUNT }, (_, index) => {
      const right = index % 2 === 1;
      const lane = Math.floor(index / 2);
      // The middle 66% is entirely clear, including on narrow screens.
      const edge = 1.1 + (lane % 6) * 2.75 + random() * 1.4;
      return {
        index,
        right,
        bubble: lane % 3 === 2,
        x: right ? 100 - edge : edge,
        start: -14 + ((lane * 11.7 + random() * 16) % 134),
        speed: 0.84 + random() * 0.66,
        drift: 3 + random() * 12,
        width: 1 + Math.floor(random() * 2),
        size: 4 + Math.floor(random() * 5),
        length: 24 + random() * 55,
        opacity: 0.33 + random() * 0.37,
        delay: `${-random() * 0.8}s`,
      };
    });
  }, [eventKey, reducedMotion]);

  const settling = settleKey === eventKey;
  if (reducedMotion || (!active && !settling)) return null;

  const ramp =
    smoothstep(0, 0.13, position) * (1 - smoothstep(0.79, 1, position));
  const energy = ramp * (0.48 + strength * 0.52);
  const braking = smoothstep(0.78, 1, position);
  const phase = settling
    ? "settle"
    : position < 0.13
      ? "charge"
      : position < 0.79
        ? "dive"
        : "brake";
  const rootStyle = {
    "--descent-duration": `${milliseconds}ms`,
    "--descent-wisp-duration": `${Math.max(280, Math.min(650, milliseconds * 0.18))}ms`,
    "--descent-settle-duration": `${SETTLE_DURATION}ms`,
  } as DescentStyle;

  return (
    <div
      key={eventKey}
      className={`descent-effects ${settling ? "descent-effects-settling" : ""}`}
      data-active={active ? "true" : "false"}
      data-phase={phase}
      style={rootStyle}
      aria-hidden="true"
    >
      <div
        className="descent-pressure-vignette"
        style={{ opacity: active ? energy * 0.88 : 0 }}
      />
      {active && (
        <div className="descent-rush-field">
          {tracks.map((track) => {
            const travel = position * 370 * track.speed;
            // Wrapping occurs outside the viewport and fades at both edges.
            const y = ((((track.start - travel + 18) % 136) + 136) % 136) - 18;
            const edgeFade =
              smoothstep(-16, 2, y) * (1 - smoothstep(98, 116, y));
            const drift =
              Math.sin(position * Math.PI * 2 + track.index) * track.drift;
            const stretch = track.bubble ? 1 : 0.58 + energy * 1.7;
            const style = {
              left: `${track.x}%`,
              opacity: edgeFade * energy * track.opacity,
              transform: `translate3d(${drift}px, ${y}%, 0)`,
              "--descent-track-width": `${track.bubble ? track.size : track.width}px`,
              "--descent-track-height": `${track.bubble ? track.size : track.length}px`,
              "--descent-track-stretch": stretch,
              "--descent-track-delay": track.delay,
            } as DescentStyle;
            return (
              <span
                key={track.index}
                className={`descent-rush-track ${track.bubble ? "descent-rush-bubble" : "descent-rush-streak"} ${track.right ? "descent-track-right" : ""}`}
                style={style}
              >
                <i />
              </span>
            );
          })}
        </div>
      )}
      {(["left", "right"] as const).map((side) => (
        <div
          className={`descent-side-flow descent-side-flow-${side}`}
          key={side}
          style={{
            opacity: active ? energy * 0.72 : 0,
            transform: `translate3d(0, ${16 - position * 36}%, 0) skewY(${side === "left" ? -8 : 8}deg)`,
          }}
        >
          <i />
          <i />
        </div>
      ))}
      <div
        key={`${eventKey}-${settling ? "arrived" : "braking"}`}
        className="descent-settling-water"
        style={
          settling
            ? undefined
            : {
                opacity: active ? Math.sin(braking * Math.PI) * 0.22 : 0,
                transform: `translate3d(0, ${braking * -12}px, 0) scaleY(${0.78 + braking * 0.3})`,
              }
        }
      >
        <i />
        <i />
      </div>
    </div>
  );
});
