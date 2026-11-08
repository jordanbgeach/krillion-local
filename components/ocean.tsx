import { memo, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import "./ocean-motion.css";
import {
  durationForDescent,
  sampleDescent,
  type DescentPhase,
} from "../lib/descent";
import { DescentEffects } from "./descent-effects";

const METRE_SCALE = 2;
const FAR_SCALE = 0.9;
const NEAR_SCALE = 2.75;
const LANDMARKS = [
  [200, "THE TWILIGHT ZONE"],
  [700, "FOLLOW THE GLOW"],
  [1000, "THE MIDNIGHT ZONE"],
  [1800, "STRANGE THINGS LIVE HERE"],
  [2800, "INTO THE BLUE UNKNOWN"],
  [4000, "THE ABYSSAL ZONE"],
  [5100, "A LONG WAY FROM THE SURFACE"],
  [6000, "HADAL WATERS"],
  [7000, "THE TRENCH · A PERFECT DIVE"],
] as const;

type DepthFrame = {
  depth: number;
  target: number;
  moving: boolean;
  progress: number;
  speed: number;
  phase: DescentPhase;
  duration: number;
  distance: number;
  eventKey: string;
};

export function useDepthAnimation(
  target: number,
  sessionId: string | undefined,
  ready: boolean,
  reduced: boolean,
) {
  const [frame, setFrame] = useState<DepthFrame>({
    depth: target,
    target,
    moving: false,
    progress: 1,
    speed: 0,
    phase: "landed",
    duration: 0,
    distance: 0,
    eventKey: "initial",
  });
  const displayed = useRef(target);
  const lastSession = useRef<string | undefined>(undefined);
  useEffect(() => {
    let animationFrame = 0;
    const eventKey = `${sessionId ?? "surface"}:${target}`;
    const snap = () => {
      displayed.current = target;
      setFrame({
        depth: target,
        target,
        moving: false,
        progress: 1,
        speed: 0,
        phase: "landed",
        duration: 0,
        distance: 0,
        eventKey,
      });
    };
    if (
      !ready ||
      lastSession.current !== sessionId ||
      reduced ||
      target <= displayed.current
    ) {
      lastSession.current = sessionId;
      snap();
      return;
    }
    const from = displayed.current;
    const distance = target - from;
    const duration = durationForDescent(distance);
    const base = { target, distance, duration, eventKey };
    let start: number | null = null;
    setFrame({ ...base, depth: from, moving: true, ...sampleDescent(0) });
    const tick = (time: number) => {
      if (start === null) start = time;
      const elapsed = Math.min(1, (time - start) / duration);
      const sample = sampleDescent(elapsed);
      displayed.current = from + distance * sample.progress;
      setFrame({
        ...base,
        depth: Math.round(displayed.current),
        moving: elapsed < 1,
        ...sample,
      });
      if (elapsed < 1) animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, sessionId, ready, reduced]);

  // The answer reveal and the first animation frame must agree immediately.
  // Restored sessions snap to their saved depth rather than replaying a dive.
  if (
    ready &&
    !reduced &&
    lastSession.current === sessionId &&
    target > frame.target
  ) {
    const distance = target - displayed.current;
    return {
      ...frame,
      target,
      moving: true,
      ...sampleDescent(0),
      distance,
      duration: durationForDescent(distance),
      eventKey: `${sessionId}:${target}`,
    };
  }
  return frame;
}

function Reef({ trench = false }: { trench?: boolean }) {
  return (
    <svg
      className={trench ? "trench-floor" : "shallow-reef"}
      viewBox="0 0 1400 200"
      preserveAspectRatio="none"
    >
      <path
        fill={trench ? "#020d1b" : "#062b3a"}
        d="M0 200V140h30v-20h30v27h22v-35h13v40h20v-23h27v38h30v-14h20v22h180v-10h52v-21h34v18h34v-8h30v28h500v-22h39v10h55v-22h40v13h29v-40h30v-20h22v33h21v-20h30v50h35V97h30V65h24v30h15v52h17v-22h25v75z"
      />
      <path
        fill={trench ? "#010916" : "#04212e"}
        d="M0 200V166h49v15h79v-8h69v17h104v-12h186v10h98v-19h45v14h159v-13h59v16h136v-9h84v-15h71v15h56v-21h31v-32h17v-32h10v32h14v42h12v-25h11v-22h8v24h10v31h87v20z"
      />
    </svg>
  );
}

type MotionStyle = CSSProperties & Record<`--${string}`, string | number>;

// These memoized groups do not rerender during the depth counter's animation.
// Only their containing camera layers receive a new transform on each frame.
const Surface = memo(function Surface() {
  return (
    <>
      <div className="sky">
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="sun" />
      </div>
      <div className="sea-surface motion-surface">
        <i className="surface-wave wave-back" />
        <i className="surface-wave wave-front" />
      </div>
      <svg
        className="surface-reflection"
        viewBox="0 0 120 170"
        shapeRendering="crispEdges"
      >
        <path d="M35 0h50v4H35zm-9 13h68v4H26zm15 15h40v4H41zm-21 15h80v3H20zm11 15h58v3H31z" />
        <path d="M14 75h92v3H14zm22 15h48v3H36zM7 107h106v2H7zm22 15h62v2H29zM0 145h120v2H0zm32 16h56v2H32z" />
      </svg>
      <div className="water-caustics">
        <i />
        <i />
      </div>
      <div className="light-beam b1" />
      <div className="light-beam b2" />
      <div className="ocean-grid" />
    </>
  );
});

const WorldScenery = memo(function WorldScenery({
  reduced,
}: {
  reduced: boolean;
}) {
  return (
    <>
      <Surface />
      {LANDMARKS.map(([metres, label], index) => (
        <div
          className={`ocean-landmark ${index % 2 ? "right" : "left"}`}
          key={metres}
          style={{
            top: `calc(var(--surface) + ${metres * METRE_SCALE + 90}px)`,
          }}
        >
          <span className="landmark-line" />
          <span>
            {label}
            <small>{metres.toLocaleString()}m</small>
          </span>
        </div>
      ))}
      {Array.from({ length: reduced ? 4 : 16 }, (_, index) => (
        <div
          key={`school-${index}`}
          className={`ocean-fish motion-school ${index % 2 ? "reverse" : ""}`}
          style={{
            top: `calc(var(--surface) + ${(100 + index * (reduced ? 1900 : 450)) * METRE_SCALE}px)`,
            left: `${index % 2 ? 75 + (index % 11) : 4 + (index % 12)}%`,
            animationDelay: `${index * -2.7}s`,
            animationDuration: `${16 + (index % 7)}s`,
          }}
        >
          <b />
          <b />
          <b />
        </div>
      ))}
      {Array.from({ length: reduced ? 2 : 5 }, (_, index) => (
        <div
          key={`jelly-${index}`}
          className="deep-jelly motion-jelly"
          style={{
            top: `calc(var(--surface) + ${(600 + index * 1450) * METRE_SCALE}px)`,
            left: `${index % 2 ? 10 : 85}%`,
            animationDelay: `${index * -2.4}s`,
          }}
        >
          <span />
          <i />
          <i />
          <i />
        </div>
      ))}
      {!reduced &&
        Array.from({ length: 28 }, (_, index) => (
          <i
            key={`glow-${index}`}
            className="ocean-glow motion-plankton"
            style={{
              top: `calc(var(--surface) + ${(180 + index * 255) * METRE_SCALE}px)`,
              left: `${5 + ((index * 37) % 90)}%`,
              animationDelay: `${index * -1.3}s`,
            }}
          />
        ))}
      {!reduced && (
        <div className="reef-fronds">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      <Reef trench />
      <div className="trench-ground" />
    </>
  );
});

function SeaSilhouette({
  kind,
}: {
  kind: "ray" | "turtle" | "whale" | "angler";
}) {
  return (
    <svg
      className={`sea-silhouette-art ${kind}`}
      viewBox="0 0 180 90"
      shapeRendering="crispEdges"
    >
      {kind === "ray" && (
        <>
          <path
            className="silhouette-wing"
            d="M84 32H72v-8H60v-8H48V8H32v12H20v12H8v12h16v8h20v8h20v-8h16v-4h20v4h16v8h20v-8h20v-8h16V32h-12V20h-12V8h-16v8h-12v8h-12v8h-12v-8H84z"
          />
          <path d="M84 42h12v20h-4v12h-4v16h-3V72h-1z" />
          <path className="silhouette-glint" d="M79 35h3v3h-3zm20 0h3v3h-3z" />
        </>
      )}
      {kind === "turtle" && (
        <>
          <path d="M58 25h50v6h12v10h15v-7h15v7h8v13h-8v6h-15v-7h-15v9h-12v6H58v-6H46V51H29v-5h17V34h12z" />
          <path
            className="silhouette-flipper"
            d="M65 29H52V15H41V7h13v6h15v14zm1 32H52v13H39v8h15V75h16zm33-32h13V16h12V9h-12v5H96zm1 32h12v12h13v8h-13v-6H96z"
          />
          <path
            className="shell-glint"
            d="M65 34h32v4H65zm-7 8h4v13h-4zm12 18h25v3H70z"
          />
        </>
      )}
      {kind === "whale" && (
        <>
          <path d="M20 35H9V25H0v19h9v6H0v18h9V58h15v5h26v6h84v-6h23v-7h13V35h-9V24h-17v-7h-43V12H90v12H70v7H45v4z" />
          <path
            className="silhouette-fin"
            d="M94 57h19v11h-6v12H96v-9h-7v-9z"
          />
          <path className="silhouette-glint" d="M147 37h4v4h-4z" />
        </>
      )}
      {kind === "angler" && (
        <>
          <path d="M49 36H35V25H23v14H12v15h11v14h12V57h14v8h21v7h40v-7h17V54h11V40h-11V28h-17v-7H70v7H49z" />
          <path d="M85 24V10h6V4h32v5H97v18z" />
          <path className="angler-lure" d="M120 4h9v5h5v9h-5v5h-9v-5h-5V9h5z" />
          <path
            className="silhouette-glint"
            d="M112 37h5v5h-5zM117 52h14v3h-14z"
          />
        </>
      )}
    </svg>
  );
}

const FarWater = memo(function FarWater({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <>
      {[420, 1500, 2700, 4000].map((top, index) => (
        <div
          className={`ocean-current current-${index % 2}`}
          key={top}
          style={{ top: top * 1.65, animationDelay: `${index * -3.1}s` }}
        />
      ))}
      {(
        [
          ["turtle", 300, "8%", "26s", "-8s"],
          ["ray", 1150, "74%", "32s", "-19s"],
          ["whale", 2050, "4%", "42s", "-13s"],
          ["angler", 3060, "82%", "30s", "-17s"],
        ] as const
      ).map(([kind, top, left, duration, delay]) => (
        <div
          className={`sea-silhouette silhouette-${kind}`}
          key={kind}
          style={{
            top: top * 1.65,
            left,
            animationDuration: duration,
            animationDelay: delay,
          }}
        >
          <SeaSilhouette kind={kind} />
        </div>
      ))}
    </>
  );
});

const SuspendedParticles = memo(function SuspendedParticles({
  reduced,
}: {
  reduced: boolean;
}) {
  return (
    <>
      {Array.from({ length: reduced ? 16 : 96 }, (_, index) => (
        <i
          key={`speck-${index}`}
          className="ocean-speck motion-speck"
          style={{
            left: `${(index * 37 + 8) % 100}%`,
            top: `${230 + ((index * 239) % 20300)}px`,
            width: index % 5 === 0 ? 3 : 2,
            height: index % 5 === 0 ? 3 : 2,
            animationDelay: `${index * -0.7}s`,
          }}
        />
      ))}
      {!reduced &&
        Array.from({ length: 10 }, (_, index) => (
          <i
            key={`bubble-${index}`}
            className="water-bubble"
            style={{
              left: `${(index * 43 + 7) % 100}%`,
              top: `${360 + index * 1950}px`,
              animationDelay: `${index * -1.4}s`,
              width: index % 3 === 0 ? 7 : 4,
              height: index % 3 === 0 ? 7 : 4,
            }}
          />
        ))}
    </>
  );
});

const NearReef = memo(function NearReef() {
  return <Reef />;
});

export function Ocean({
  descent,
  active,
  vehicle,
  reducedMotion = false,
}: {
  descent: DepthFrame;
  active: boolean;
  vehicle: ReactNode;
  reducedMotion?: boolean;
}) {
  const { depth, moving, progress, speed, duration, eventKey, phase } = descent;
  const visualSpeed = reducedMotion ? 0 : speed;
  const [settling, setSettling] = useState(false);
  const wasMoving = useRef(false);
  useEffect(() => {
    const justStopped =
      wasMoving.current && !moving && active && !reducedMotion;
    wasMoving.current = moving && active;
    setSettling(justStopped);
    if (!justStopped) return;
    const timeout = window.setTimeout(() => setSettling(false), 820);
    return () => window.clearTimeout(timeout);
  }, [moving, active, reducedMotion]);

  return (
    <div
      className={`ocean-scene depth-scene motion-ocean ${depth > 500 ? "deep" : ""} ${depth > 4000 ? "abyss" : ""} ${moving ? "travelling" : ""} ${reducedMotion ? "motion-reduced" : ""}`}
      aria-hidden="true"
      data-descent-phase={phase}
      style={
        {
          "--dive-speed": visualSpeed,
          "--dive-pitch": `${-3 + visualSpeed * 32}deg`,
          "--dive-sink": `${visualSpeed * 28}px`,
          "--dive-zoom": 1 + visualSpeed * 0.035,
          "--depth-darkness": Math.min(0.28, depth / 26000),
          "--depth-light": Math.max(0, 1 - depth / 5500),
        } as MotionStyle
      }
    >
      <div className="ocean-camera">
        <div
          className="ocean-world"
          style={{ transform: `translate3d(0, ${-depth * METRE_SCALE}px, 0)` }}
        >
          <WorldScenery reduced={reducedMotion} />
        </div>
        <div
          className="ocean-far-water"
          style={{ transform: `translate3d(0, ${-depth * FAR_SCALE}px, 0)` }}
        >
          <FarWater reduced={reducedMotion} />
        </div>
        <div
          className="ocean-particles"
          style={{ transform: `translate3d(0, ${-depth * NEAR_SCALE}px, 0)` }}
        >
          <SuspendedParticles reduced={reducedMotion} />
        </div>
        <div
          className="reef-parallax"
          style={{ transform: `translate3d(0, ${-depth * 2.4}px, 0)` }}
        >
          <NearReef />
        </div>
      </div>
      <div className="depth-water-tone" />
      <div className="depth-light-falloff" />
      {active && (
        <div
          className={`descent-craft motion-craft ${moving ? "diving" : ""} ${settling ? "settling" : ""}`}
        >
          <div className="craft-wake">
            <i />
            <i />
            <i />
          </div>
          <div className="craft-bob">
            <div className="craft-body">
              <div
                className="craft-searchlight"
                style={{ opacity: 0.1 + (Math.min(depth, 5000) / 5000) * 0.28 }}
              />
              <svg
                className="craft-plume"
                viewBox="0 0 80 40"
                shapeRendering="crispEdges"
              >
                <path d="M80 12H62V8H40v4H20v5H0v7h20v5h20v4h22v-4h18z" />
                <path d="M80 16H58v-4H43v4H25v8h18v4h15v-4h22z" />
              </svg>
              <div className="craft-hull">
                {vehicle}
                <i className="craft-window-glow" />
                <i className="craft-keel-light" />
              </div>
              <div className="craft-exhaust">
                {Array.from({ length: reducedMotion ? 0 : 7 }, (_, index) => (
                  <i
                    key={index}
                    style={
                      {
                        "--wake-x": `${-46 - index * 13}px`,
                        "--wake-y": `${-14 - (index % 3) * 9}px`,
                        animationDelay: `${index * -0.31}s`,
                        width: index % 3 === 0 ? 6 : 3,
                        height: index % 3 === 0 ? 6 : 3,
                        top: `${40 + (index % 4) * 8}%`,
                      } as MotionStyle
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <DescentEffects
        active={active && moving}
        reducedMotion={reducedMotion}
        intensity={visualSpeed}
        progress={progress}
        duration={duration}
        eventKey={eventKey}
      />
      <div className="ocean-edge-shade" />
      <div className="scanlines" />
    </div>
  );
}

export function DepthRuler({ depth }: { depth: number }) {
  const start = Math.max(0, Math.floor((depth - 200) / 200) * 200);
  const ticks = Array.from({ length: 9 }, (_, i) => start + i * 200).filter(
    (n) => n <= 7400,
  );
  return (
    <aside
      className="depth-ruler moving-ruler"
      aria-label={`Current depth ${Math.round(depth).toLocaleString()} meters`}
    >
      <div className="depth-track">
        <span className="depth-marker">
          YOU <ArrowRight size={12} />
        </span>
        {ticks.map((n) => (
          <div
            className="ruler-tick"
            key={n}
            style={{ top: `${((n - depth + 200) / 1400) * 100}%` }}
          >
            <span>{n === 0 ? "SURFACE" : `${n.toLocaleString()}m`}</span>
          </div>
        ))}
      </div>
      <span className="ruler-caption">
        {depth >= 6000 ? "THE TRENCH" : "KEEP GOING ↓"}
      </span>
    </aside>
  );
}
