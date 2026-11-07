import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

const METRE_SCALE = 0.62;
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

export function useDepthAnimation(
  target: number,
  sessionId: string | undefined,
  ready: boolean,
  reduced: boolean,
) {
  const [depth, setDepth] = useState(target);
  const [moving, setMoving] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const displayed = useRef(target);
  const lastSession = useRef<string | undefined>(undefined);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    let frame = 0;
    const snap = () => {
      displayed.current = target;
      setDepth(target);
      setMoving(false);
    };
    if (
      !ready ||
      lastSession.current !== sessionId ||
      reduced ||
      systemReduced ||
      target <= displayed.current
    ) {
      lastSession.current = sessionId;
      snap();
      return;
    }
    const from = displayed.current;
    const distance = target - from;
    const duration = Math.min(1750, 1050 + distance * 0.45);
    let start: number | null = null;
    setMoving(true);
    const tick = (time: number) => {
      if (start === null) start = time;
      const progress = Math.min(1, (time - start) / duration);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      displayed.current = from + distance * eased;
      setDepth(Math.round(displayed.current));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else snap();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, sessionId, ready, reduced, systemReduced]);
  return {
    depth,
    moving:
      moving || (ready && lastSession.current === sessionId && depth < target),
  };
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

export function Ocean({
  depth,
  moving,
  active,
  vehicle,
}: {
  depth: number;
  moving: boolean;
  active: boolean;
  vehicle: ReactNode;
}) {
  return (
    <div
      className={`ocean-scene depth-scene ${depth > 500 ? "deep" : ""} ${depth > 4000 ? "abyss" : ""} ${moving ? "travelling" : ""}`}
      aria-hidden="true"
    >
      <div
        className="ocean-world"
        style={{ transform: `translate3d(0, ${-depth * METRE_SCALE}px, 0)` }}
      >
        <div className="sky">
          <div className="cloud c1" />
          <div className="cloud c2" />
          <div className="sun" />
        </div>
        <div className="sea-surface" />
        <div className="light-beam b1" />
        <div className="light-beam b2" />
        <div className="ocean-grid" />
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
        {Array.from({ length: 31 }, (_, index) => (
          <div
            key={index}
            className={`ocean-fish ${index % 2 ? "reverse" : ""}`}
            style={{
              top: `calc(var(--surface) + ${100 + index * 147}px)`,
              left: `${index % 2 ? 70 + (index % 17) : 4 + (index % 13)}%`,
              animationDelay: `${index * -1.9}s`,
              animationDuration: `${9 + (index % 8)}s`,
            }}
          >
            <b />
            <b />
            <b />
          </div>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="deep-jelly"
            style={{
              top: `calc(var(--surface) + ${380 + i * 540}px)`,
              left: `${i % 2 ? 12 : 81}%`,
              animationDelay: `${i * -2}s`,
            }}
          >
            <span />
            <i />
            <i />
            <i />
          </div>
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <i
            key={i}
            className="ocean-glow"
            style={{
              top: `calc(var(--surface) + ${1000 + i * 185}px)`,
              left: `${5 + ((i * 37) % 90)}%`,
              animationDelay: `${i * -0.7}s`,
            }}
          />
        ))}
        <Reef trench />
        <div className="trench-ground" />
      </div>
      <div
        className="ocean-particles"
        style={{ transform: `translate3d(0, ${-depth * 0.85}px, 0)` }}
      >
        {Array.from({ length: 140 }, (_, i) => (
          <i
            key={i}
            className="ocean-speck"
            style={{
              left: `${(i * 37 + 8) % 100}%`,
              top: `${230 + ((i * 113) % 6500)}px`,
              width: i % 4 === 0 ? 4 : 2,
              height: i % 4 === 0 ? 4 : 2,
              animationDelay: `${i * -0.7}s`,
            }}
          />
        ))}
      </div>
      <div
        className="reef-parallax"
        style={{ transform: `translate3d(0,${-depth * 0.9}px,0)` }}
      >
        <Reef />
      </div>
      {active && (
        <div className={`descent-craft ${moving ? "diving" : ""}`}>
          <div className="craft-body">{vehicle}</div>
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      <div className="descent-streaks">
        {Array.from({ length: 10 }, (_, i) => (
          <i
            key={i}
            style={{ left: `${6 + i * 10}%`, animationDelay: `${i * -0.11}s` }}
          />
        ))}
      </div>
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
