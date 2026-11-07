"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import "./game-motion.css";

/** The app's explicit preference and the operating-system preference both win. */
export function useReducedMotion(manual = false): boolean {
  const [systemReduced, setSystemReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(preference.matches);
    update();
    if (typeof preference.addEventListener === "function") {
      preference.addEventListener("change", update);
      return () => preference.removeEventListener("change", update);
    }
    preference.addListener(update);
    return () => preference.removeListener(update);
  }, []);
  return manual || systemReduced;
}

export type AnimatedNumberProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "prefix"
> & {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  animateOnMount?: boolean;
  reducedMotion?: boolean;
  decimals?: number;
  /** Override the accessible final reading, for example "100 points". */
  label?: string;
};

/** Per-frame writes stay inside this span: no React/App renders during a tween. */
export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  duration = 700,
  className = "",
  prefix = "",
  suffix = "",
  animateOnMount = false,
  reducedMotion = false,
  decimals = 0,
  label,
  ...spanProps
}: AnimatedNumberProps) {
  const target = Number.isFinite(value) ? value : 0;
  const precision = Math.min(
    6,
    Math.max(0, Math.floor(Number.isFinite(decimals) ? decimals : 0)),
  );
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),
    [precision],
  );
  const reduced = useReducedMotion(reducedMotion);
  const wrapper = useRef<HTMLSpanElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const initial = useRef(animateOnMount && !reduced ? 0 : target);
  const displayed = useRef(initial.current);
  const mounted = useRef(false);
  const finalText = formatter.format(target);

  useEffect(() => {
    const element = digits.current;
    const container = wrapper.current;
    if (!element || !container) return;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const wasMounted = mounted.current;
    mounted.current = true;
    const from = displayed.current;
    const milliseconds = Number.isFinite(duration)
      ? Math.min(2200, Math.max(0, duration))
      : 700;
    const snap = (settle: boolean) => {
      displayed.current = target;
      element.textContent = formatter.format(target);
      container.classList.remove("gm-number-counting");
      if (settle && !reduced && !container.closest(".reduce-motion")) {
        container.classList.add("gm-number-settling");
        settleTimer = setTimeout(
          () => container.classList.remove("gm-number-settling"),
          260,
        );
      }
    };
    container.classList.remove("gm-number-settling");
    if (
      (!wasMounted && !animateOnMount) ||
      reduced ||
      container.closest(".reduce-motion") ||
      milliseconds === 0 ||
      from === target
    ) {
      snap(false);
      return;
    }
    container.classList.add("gm-number-counting");
    let started: number | null = null;
    const tick = (time: number) => {
      // Also honor an ancestor class toggled by an app that omitted the prop.
      if (container.closest(".reduce-motion")) {
        snap(false);
        return;
      }
      if (started === null) started = time;
      const progress = Math.min(
        1,
        Math.max(0, (time - started) / milliseconds),
      );
      const eased = 1 - Math.pow(1 - progress, 4);
      displayed.current = from + (target - from) * eased;
      // Round towards the start so a one-point change never appears to finish early.
      const scale = 10 ** precision;
      const current =
        (target > from
          ? Math.floor(displayed.current * scale)
          : Math.ceil(displayed.current * scale)) / scale;
      element.textContent = formatter.format(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else snap(true);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      container.classList.remove("gm-number-counting", "gm-number-settling");
    };
  }, [target, duration, formatter, animateOnMount, reduced, precision]);

  return (
    <span
      {...spanProps}
      ref={wrapper}
      className={`gm-animated-number ${className}`}
    >
      <span className="gm-final-reading">
        {label ?? `${prefix}${finalText}${suffix}`}
      </span>
      <span className="gm-number-visual" aria-hidden="true">
        {prefix && <span className="gm-number-prefix">{prefix}</span>}
        <span className="gm-number-digits" ref={digits}>
          {formatter.format(initial.current)}
        </span>
        {suffix && <span className="gm-number-suffix">{suffix}</span>}
      </span>
    </span>
  );
});

type EffectProps = {
  score: number;
  reducedMotion?: boolean;
  className?: string;
};
type ParticleStyle = CSSProperties & Record<`--gm-${string}`, string | number>;
const completedCelebrations = new Set<string>();

/** One timer per event; StrictMode replays do not restart the event clock. */
function useOneShot(
  key: string,
  lifetime: number,
  disabled: boolean,
  remember = false,
): boolean {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const event = useRef<{
    key: string;
    started: number;
    skipped: boolean;
  } | null>(null);
  useEffect(() => {
    if (event.current?.key !== key) {
      event.current = {
        key,
        started: Date.now(),
        skipped: disabled || (remember && completedCelebrations.has(key)),
      };
      if (remember) {
        completedCelebrations.add(key);
        if (completedCelebrations.size > 64)
          completedCelebrations.delete(
            completedCelebrations.values().next().value!,
          );
      }
    }
    if (disabled) event.current.skipped = true;
    const remaining = lifetime - (Date.now() - event.current.started);
    if (event.current.skipped || remaining <= 0) {
      setActiveKey(null);
      return;
    }
    setActiveKey(key);
    const timeout = setTimeout(() => setActiveKey(null), remaining);
    return () => clearTimeout(timeout);
  }, [key, lifetime, disabled, remember]);
  return activeKey === key;
}

function randomSequence(key: string): () => number {
  let state = 2166136261;
  for (const char of key) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function revealTone(score: number) {
  return score >= 100
    ? "#f2d493"
    : score >= 85
      ? "#c6b2ef"
      : score >= 60
        ? "#9de4cb"
        : "#8bd1d3";
}

function Constellation({ count }: { count: number }) {
  const points = [
    [74, 118],
    [128, 56],
    [200, 78],
    [400, 78],
    [472, 56],
    [526, 118],
    [476, 205],
    [124, 205],
  ].slice(0, count);
  return (
    <svg
      className="gm-gem-constellation"
      viewBox="0 0 600 270"
      fill="none"
      focusable="false"
    >
      <path
        className="gm-constellation-line"
        d="M74 118L128 56L200 78M400 78L472 56L526 118"
      />
      {count > 6 && (
        <path
          className="gm-constellation-line gm-constellation-line-lower"
          d="M74 118L124 205M526 118L476 205"
        />
      )}
      {points.map(([x, y], index) => (
        <g key={index} transform={`translate(${x} ${y})`}>
          <path
            className="gm-gem-star"
            style={{ animationDelay: `${170 + index * 75}ms` }}
            d="M-1-7H1V-3H3V-1H7V1H3V3H1V7H-1V3H-3V1H-7V-1H-3V-3H-1Z"
          />
          {index % 3 === 1 && (
            <path className="gm-gem-core" d="M0-3L3 0L0 3L-3 0Z" />
          )}
        </g>
      ))}
    </svg>
  );
}

export const RevealEffects = memo(function RevealEffects({
  score,
  roundKey,
  reducedMotion = false,
  className = "",
}: EffectProps & { roundKey: string | number }) {
  const reduced = useReducedMotion(reducedMotion);
  const key = `reveal:${roundKey}:${score}`;
  const rare = score >= 85;
  const active = useOneShot(key, rare ? 3500 : 2700, reduced || score <= 0);
  const starCount = score >= 100 ? 8 : rare ? 6 : 0;
  const particleCount =
    score >= 100 ? 20 : rare ? 16 : score >= 60 ? 14 : score >= 30 ? 10 : 7;
  const particles = useMemo(() => {
    const random = randomSequence(key);
    return Array.from({ length: particleCount }, (_, index) => ({
      kind: (rare && index % 4 === 0) || index % 7 === 0 ? "spark" : "bubble",
      style: {
        "--gm-start-x": `${18 + random() * 64}%`,
        "--gm-start-y": `${95 + random() * 95}px`,
        "--gm-dx": `${-55 + random() * 110}px`,
        "--gm-dy": `${-85 - random() * (rare ? 175 : 110)}px`,
        "--gm-delay": `${Math.round(random() * (rare ? 620 : 340))}ms`,
        "--gm-duration": `${Math.round(1250 + random() * (rare ? 1150 : 700))}ms`,
        "--gm-size": `${Math.round(rare ? 3 + random() * 4 : 2 + random() * 3)}px`,
        "--gm-turn": `${-70 + random() * 140}deg`,
      } as ParticleStyle,
    }));
  }, [key, particleCount, rare]);
  if (!active || reduced || score <= 0) return null;
  return (
    <div
      key={key}
      className={`gm-effects gm-reveal-effects ${rare ? "gm-reveal-rare" : ""} ${score >= 100 ? "gm-reveal-gem" : ""} ${className}`}
      aria-hidden="true"
      style={{ "--gm-accent": revealTone(score) } as ParticleStyle}
    >
      <div className="gm-discovery-glow" />
      <i className="gm-sonar-ring gm-sonar-ring-one" />
      <i className="gm-sonar-ring gm-sonar-ring-two" />
      {rare && <i className="gm-sonar-ring gm-sonar-ring-three" />}
      {particles.map((particle, index) => (
        <i
          key={index}
          className={`gm-particle gm-particle-${particle.kind}`}
          style={particle.style}
        />
      ))}
      {starCount > 0 && <Constellation count={starCount} />}
    </div>
  );
});

export const CompletionEffects = memo(function CompletionEffects({
  score,
  sessionId,
  reducedMotion = false,
  className = "",
}: EffectProps & { sessionId: string }) {
  const reduced = useReducedMotion(reducedMotion);
  const key = `complete:${sessionId}`;
  const active = useOneShot(key, 4300, reduced, true);
  const count = score >= 500 ? 28 : score >= 250 ? 22 : 16;
  const particles = useMemo(() => {
    const random = randomSequence(key);
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + (random() - 0.5) * 0.18;
      const reach = 110 + random() * 135;
      return {
        kind: index % 4 === 0 ? "spark" : "bubble",
        style: {
          "--gm-start-x": "50%",
          "--gm-start-y": "160px",
          "--gm-dx": `${Math.cos(angle) * reach}px`,
          "--gm-dy": `${Math.sin(angle) * reach * 0.64 - 65}px`,
          "--gm-delay": `${Math.round(100 + random() * 650)}ms`,
          "--gm-duration": `${Math.round(2200 + random() * 900)}ms`,
          "--gm-size": `${Math.round(2 + random() * 4)}px`,
          "--gm-turn": `${-110 + random() * 220}deg`,
        } as ParticleStyle,
      };
    });
  }, [key, count]);
  if (!active || reduced) return null;
  return (
    <div
      key={key}
      className={`gm-effects gm-completion-effects ${className}`}
      aria-hidden="true"
      style={
        { "--gm-accent": score >= 500 ? "#f0d496" : "#a4e8d2" } as ParticleStyle
      }
    >
      <div className="gm-completion-bloom" />
      <i className="gm-completion-orbit gm-completion-orbit-one" />
      <i className="gm-completion-orbit gm-completion-orbit-two" />
      {particles.map((particle, index) => (
        <i
          key={index}
          className={`gm-particle gm-particle-${particle.kind}`}
          style={particle.style}
        />
      ))}
    </div>
  );
});

export const CheckingSonar = memo(function CheckingSonar({
  className = "",
  reducedMotion = false,
}: {
  className?: string;
  reducedMotion?: boolean;
}) {
  const reduced = useReducedMotion(reducedMotion);
  return (
    <span
      className={`gm-checking-sonar ${reduced ? "gm-sonar-still" : ""} ${className}`}
      aria-hidden="true"
    >
      <i className="gm-checking-sweep" />
      <i className="gm-checking-ping" />
      <i className="gm-checking-ping gm-checking-ping-delayed" />
      <i className="gm-checking-center" />
    </span>
  );
});
