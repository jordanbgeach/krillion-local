"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Globe2,
  HelpCircle,
  History,
  Infinity as InfinityIcon,
  Leaf,
  ListFilter,
  Plus,
  RotateCcw,
  Settings,
  Share2,
  Sparkles,
  Upload,
  Waves,
  X,
} from "lucide-react";
import { builtInPrompts } from "../lib/data";
import { Ocean, DepthRuler, useDepthAnimation } from "../components/ocean";
import {
  AnimatedNumber,
  RevealEffects,
  CompletionEffects,
  CheckingSonar,
  useReducedMotion,
} from "../components/game-motion";
import "./motion.css";
import {
  localDateKey,
  normalizeAnswer,
  matchExactAnswer,
  suggestAnswerCorrections,
  checkPromptConstraints,
  randomSeed,
  scoreColor,
  scoreLabel,
  drawFreshPrompts,
  selectPrompts,
  validateCustomPrompts,
  validateSave,
} from "../lib/engine";
import { mergeCustomPrompts, validateSession } from "../lib/session";
import {
  ROTATION_KEY,
  readPromptRotation,
  rememberPromptDraw,
  rotationCategoryKey,
  encodeDrawSeed,
  decodeDrawSeed,
} from "../lib/rotation";
import type { PromptRotation } from "../lib/rotation";
import { matchDictionaryAnswer, dictionaryWordCount } from "../lib/lexicon";
import { knownAnswersForPrompt } from "../lib/answer-bank";
import {
  createAIClient,
  describeAIError,
  exportLearnedBank,
  learnAnswer,
  LEARNED_BANK_KEY,
  mergeLearnedBanks,
  validateLearnedBank,
  withLearnedAnswers,
} from "../lib/ai";
import type { AIStatus, LearnedBank } from "../lib/ai";
import type { Session } from "../lib/session";
import type {
  Answer,
  Category,
  DiveRecord,
  Prompt,
  RoundResult,
} from "../lib/types";

const CATEGORIES: Category[] = [
  "Geography",
  "Nature",
  "Science",
  "Culture",
  "Words",
  "Food",
];
const SAVE_KEY = "krillion-save-v1";
const ACTIVE_KEY = "krillion-active-v1";
type View = "dive" | "guide" | "logbook";
type Mode = DiveRecord["mode"];
type Modal = "help" | "settings" | "custom" | "leave" | null;
const modeNames = {
  unlimited: "Unlimited",
  daily: "Daily dive",
  practice: "Practice",
};

function Submarine({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "submarine small" : "submarine"}
      viewBox="0 0 144 88"
      role="img"
      aria-label="A little coral submarine"
    >
      <path
        fill="#143647"
        d="M50 9h34v6H50zM72 0h12v19H72zM0 37h14v31H0zM13 43h17v20H13z"
      />
      <path
        fill="#df846a"
        d="M40 20h71v7h15v10h8v31h-8v9h-15v7H40v-7H27V67h-8V37h8V27h13z"
      />
      <path fill="#f6b98c" d="M40 20h71v7h15v10H34v-10h6zM27 37h7v30h-7z" />
      <path fill="#b85754" d="M34 67h92v10h-15v7H40v-7h-6z" />
      <path fill="#183d4a" d="M73 30h29v6h8v28h-8v6H73v-6h-8V36h8z" />
      <path fill="#9de3de" d="M77 37h21v6h6v16h-6v5H77v-5h-6V43h6z" />
      <path fill="#e0f4e6" d="M77 37h15v6H77zM71 43h6v10h-6z" />
      <path
        fill="#153b46"
        d="M39 44h8v8h-8zM54 44h6v8h-6zM55 77h13v11H55zM99 77h13v11H99z"
      />
      <path fill="#f7d7a1" d="M126 43h15v13h-15z" />
    </svg>
  );
}

const AnswerBank = memo(function AnswerBank({
  prompt,
  initiallyOpen = false,
}: {
  prompt: Prompt;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(80);
  const knownAnswers = useMemo(() => {
    const curated =
      builtInPrompts.find((item) => item.id === prompt.id) ?? prompt;
    return knownAnswersForPrompt(prompt, curated);
  }, [prompt.id, prompt.answers]);
  const sortedAnswers = useMemo(
    () =>
      open
        ? [...knownAnswers].sort(
            (a, b) => b.score - a.score || a.name.localeCompare(b.name),
          )
        : [],
    [knownAnswers, open],
  );
  const searchIndex = useMemo(
    () =>
      sortedAnswers.map((answer) => ({
        answer,
        names: [answer.name, ...(answer.aliases ?? [])].map(normalizeAnswer),
      })),
    [sortedAnswers],
  );
  const answers = useMemo(() => {
    const query = normalizeAnswer(filter);
    return searchIndex
      .filter((item) => item.names.some((name) => name.includes(query)))
      .map((item) => item.answer);
  }, [searchIndex, filter]);
  return (
    <div className="answer-bank">
      <button
        className="bank-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <BookOpen size={15} />
        <span>{open ? "Close" : "Explore"} answer bank</span>
        <span className="muted">
          {knownAnswers.length.toLocaleString()} answers
        </span>
        <ChevronDown size={15} className={open ? "rotate" : ""} />
      </button>
      {open && (
        <div className="bank-content">
          <p className="scope-note">{prompt.note}</p>
          <input
            className="small-input"
            type="search"
            aria-label="Search accepted answers"
            placeholder="Find an answer…"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setVisibleCount(80);
            }}
          />
          <div className="answer-grid">
            {answers.slice(0, visibleCount).map((a) => (
              <div className="bank-answer" key={a.name}>
                <span>{a.name}</span>
                <b style={{ color: scoreColor(a.score) }}>{a.score}</b>
              </div>
            ))}
          </div>
          {answers.length > 0 && (
            <div className="bank-pagination">
              <span aria-live="polite">
                Showing{" "}
                {Math.min(visibleCount, answers.length).toLocaleString()} of{" "}
                {answers.length.toLocaleString()} matches
              </span>
              {visibleCount < answers.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 80)}
                >
                  Show 80 more <ChevronDown size={13} />
                </button>
              )}
            </div>
          )}
          {!answers.length && <p className="muted">No matching answers.</p>}
          <p className="bank-foot">
            Dictionary words score instantly. Jev can check additional valid
            answers. Scores are familiarity estimates.
          </p>
          {prompt.source && (
            <a
              className="source-link"
              href={prompt.source}
              target="_blank"
              rel="noreferrer"
            >
              Reference source ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
});

export default function Home() {
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [unreadableSave, setUnreadableSave] = useState("");
  const [view, setView] = useState<View>("dive");
  const [mode, setMode] = useState<Mode>("unlimited");
  const [timer, setTimer] = useState(25);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [seedInput, setSeedInput] = useState("");
  const [history, setHistory] = useState<DiveRecord[]>([]);
  const [rotation, setRotation] = useState<PromptRotation>({
    version: 1,
    seenByCategories: {},
    recentPromptIds: [],
  });
  const [customPrompts, setCustomPrompts] = useState<Prompt[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [guess, setGuess] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(25);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");
  const [guideSearch, setGuideSearch] = useState("");
  const [guideCategory, setGuideCategory] = useState("All");
  const [customText, setCustomText] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [customCategory, setCustomCategory] = useState<Category>("Culture");
  const [customAnswers, setCustomAnswers] = useState("");
  const [customError, setCustomError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const prefersReducedMotion = useReducedMotion(reducedMotion);
  const [learnedBank, setLearnedBank] = useState<LearnedBank>({});
  const [learnedStorageBlocked, setLearnedStorageBlocked] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [aiWaiting, setAIWaiting] = useState(false);
  const [corrections, setCorrections] = useState<Answer[]>([]);
  const [canRetryAI, setCanRetryAI] = useState(false);
  const aiClientRef = useRef(createAIClient());
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const submissionSequence = useRef(0);
  const pendingSubmission = useRef<{
    token: number;
    sessionId: string;
    round: number;
  } | null>(null);
  // null deadline freezes only the short submitted-answer check. A rejected or
  // unavailable judgment restores the exact unused time.
  const pausedClock = useRef<{ key: string; deadline: number | null } | null>(
    null,
  );
  const answerRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const basePrompts = useMemo(
    () => [...builtInPrompts, ...customPrompts],
    [customPrompts],
  );
  const allPrompts = useMemo(
    () => basePrompts.map((prompt) => withLearnedAnswers(prompt, learnedBank)),
    [basePrompts, learnedBank],
  );
  const promptMap = useMemo(
    () => new Map(allPrompts.map((p) => [p.id, p])),
    [allPrompts],
  );
  const currentPrompt = session
    ? promptMap.get(session.promptIds[session.round])
    : undefined;
  const totalScore = session?.results.reduce((s, r) => s + r.score, 0) ?? 0;
  const depth = totalScore * 10;
  const descent = useDepthAnimation(
    depth,
    session?.id,
    ready,
    prefersReducedMotion,
  );
  const isDescending = descent.moving;
  const descentComplete = !isDescending && descent.depth >= depth;
  const lastDrop = (session?.results.at(-1)?.score ?? 0) * 10;
  const best = Math.max(0, ...history.map((h) => h.score));
  const availableCount = allPrompts.filter((p) =>
    categories.includes(p.category),
  ).length;

  useEffect(() => {
    let storedCustom: Prompt[] = [];
    let storedHistory: DiveRecord[] = [];
    try {
      const learned = localStorage.getItem(LEARNED_BANK_KEY);
      if (learned) {
        try {
          if (learned.length > 3_000_000)
            throw new Error("Learned bank is too large.");
          setLearnedBank(validateLearnedBank(JSON.parse(learned)));
        } catch {
          setLearnedStorageBlocked(true);
          setToast(
            "The learned answer bank could not be read. Your curated bank and logbook are still available; the original learned data has been preserved.",
          );
        }
      }
    } catch {
      setLearnedStorageBlocked(true);
    }
    try {
      const raw =
        localStorage.getItem(SAVE_KEY) ??
        localStorage.getItem("deepcut-save-v1");
      if (raw) {
        try {
          const saved = validateSave(JSON.parse(raw));
          setHistory(saved.history);
          storedHistory = saved.history;
          storedCustom = saved.customPrompts;
          setCustomPrompts(storedCustom);
        } catch {
          setStorageBlocked(true);
          setUnreadableSave(raw);
          setToast(
            "Your saved file could not be read and has been preserved. Download the original in Settings, or import a valid backup.",
          );
        }
      }
      const active =
        localStorage.getItem(ACTIVE_KEY) ??
        localStorage.getItem("deepcut-active-v1");
      if (active) {
        try {
          setSession(
            validateSession(
              JSON.parse(active),
              new Set([...builtInPrompts, ...storedCustom].map((p) => p.id)),
            ),
          );
        } catch {
          setToast(
            "An unfinished dive could not be resumed. Your completed dives are safe.",
          );
        }
      }
      setReducedMotion(
        (localStorage.getItem("krillion-motion") ??
          localStorage.getItem("deepcut-motion")) === "reduced",
      );
      try {
        const preferences = JSON.parse(
          localStorage.getItem("krillion-preferences") ?? "null",
        );
        if (
          preferences &&
          ["unlimited", "daily", "practice"].includes(preferences.mode)
        )
          setMode(preferences.mode);
        if (preferences && [0, 25, 45].includes(preferences.timer))
          setTimer(preferences.timer);
        if (
          preferences &&
          Array.isArray(preferences.categories) &&
          preferences.categories.length > 0 &&
          preferences.categories.every((c: Category) => CATEGORIES.includes(c))
        )
          setCategories([...new Set(preferences.categories)] as Category[]);
      } catch {
        /* Invalid preferences do not affect saved dive history. */
      }
    } catch {
      setStorageBlocked(true);
      setToast(
        "Browser storage is unavailable. You can play and export a backup from Settings.",
      );
    }
    const availableIds = new Set(
      [...builtInPrompts, ...storedCustom].map((prompt) => prompt.id),
    );
    const historyIds = storedHistory.flatMap((dive) =>
      dive.results.map((result) => result.promptId),
    );
    try {
      const raw = localStorage.getItem(ROTATION_KEY);
      setRotation(
        readPromptRotation(
          raw ? JSON.parse(raw) : null,
          availableIds,
          historyIds,
        ),
      );
    } catch {
      setRotation(readPromptRotation(null, availableIds, historyIds));
    }
    setReady(true);
  }, []);
  useEffect(() => {
    let active = true;
    let generation = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let lastStarted = 0;
    const check = async (attempt: number, run: number) => {
      lastStarted = Date.now();
      let enabled = false;
      try {
        const status = await aiClientRef.current.status();
        if (!active || run !== generation) return;
        enabled = status.enabled;
        setAIStatus(status);
      } catch {
        if (!active || run !== generation) return;
        setAIStatus({ enabled: false, model: "", version: 1 });
      }
      if (!enabled && attempt < 2) {
        retry = setTimeout(
          () => {
            void check(attempt + 1, run);
          },
          attempt === 0 ? 3000 : 10_000,
        );
      }
    };
    const refresh = () => {
      clearTimeout(retry);
      generation += 1;
      void check(0, generation);
    };
    const onFocus = () => {
      // Returning after server setup can discover a newly activated key, without polling.
      if (Date.now() - lastStarted >= 10_000) refresh();
    };
    // Availability is optional; checks never delay saves, controls, or a dive.
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      generation += 1;
      clearTimeout(retry);
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  useEffect(() => {
    if (!ready || learnedStorageBlocked) return;
    try {
      localStorage.setItem(
        LEARNED_BANK_KEY,
        JSON.stringify(exportLearnedBank(learnedBank)),
      );
    } catch {
      setToast(
        "Learned answers are available for this session. Export a backup to keep them; browser storage is unavailable.",
      );
    }
  }, [ready, learnedBank, learnedStorageBlocked]);
  useEffect(() => {
    if (!session || !aiStatus?.enabled) return;
    let active = true;
    const prompts = session.promptIds
      .map((id) => basePrompts.find((prompt) => prompt.id === id))
      .filter((prompt): prompt is Prompt => !!prompt);
    void aiClientRef.current
      .bank(prompts)
      .then((bank) => {
        if (active)
          setLearnedBank((previous) => mergeLearnedBanks(previous, bank));
      })
      .catch(() => {
        /* Curated answers remain ready while the shared bank is offline. */
      });
    return () => {
      active = false;
    };
    // Prefetch once per dive, independently of its clock and answer submissions.
  }, [session?.id, aiStatus?.enabled]);
  useEffect(() => {
    if (!ready || storageBlocked) return;
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 1, history, customPrompts }),
      );
    } catch {
      setToast(
        "Browser storage is full or unavailable. Export your logbook to keep a backup.",
      );
    }
  }, [history, customPrompts, ready, storageBlocked]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        "krillion-preferences",
        JSON.stringify({ mode, timer, categories }),
      );
    } catch {
      /* Storage warnings are handled by logbook persistence. */
    }
  }, [mode, timer, categories, ready]);
  useEffect(() => {
    if (!ready) return;
    try {
      if (session) localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
      else {
        localStorage.removeItem(ACTIVE_KEY);
        localStorage.removeItem("deepcut-active-v1");
      }
    } catch {
      /* backup messaging is handled by save persistence */
    }
  }, [session, ready]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    if (modal) {
      dialogRef.current?.showModal();
    } else dialogRef.current?.close();
  }, [modal]);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, session?.id, session?.round, session?.stage]);
  useEffect(() => {
    if (view !== "dive" || modal) return;
    if (session?.stage === "question" && !aiWaiting) answerRef.current?.focus();
    if (session?.stage === "reveal" && descentComplete)
      nextRef.current?.focus({ preventScroll: true });
  }, [session?.round, session?.stage, view, modal, aiWaiting, descentComplete]);

  const landAnswer = useCallback(
    (result: RoundResult, expected?: { sessionId: string; round: number }) => {
      setSession((prev) => {
        if (
          !prev ||
          prev.stage !== "question" ||
          (expected &&
            (prev.id !== expected.sessionId ||
              prev.round !== expected.round)) ||
          result.promptId !== prev.promptIds[prev.round]
        )
          return prev;
        return {
          ...prev,
          results: [...prev.results, result],
          stage: "reveal",
          deadline: null,
        };
      });
      setError("");
    },
    [],
  );
  useEffect(() => {
    if (
      !session ||
      session.stage !== "question" ||
      !session.timer ||
      session.deadline === null ||
      !currentPrompt
    )
      return;
    const deadline = session.deadline;
    const tick = () => {
      const override = pausedClock.current;
      const effectiveDeadline =
        override?.key === `${session.id}:${session.round}`
          ? override.deadline
          : deadline;
      if (effectiveDeadline === null) return;
      const left = Math.max(
        0,
        Math.ceil((effectiveDeadline - Date.now()) / 1000),
      );
      setSeconds(left);
      if (left === 0)
        landAnswer(
          {
            promptId: currentPrompt.id,
            input: "",
            answer: null,
            score: 0,
            timedOut: true,
            corrected: false,
          },
          { sessionId: session.id, round: session.round },
        );
    };
    tick();
    const id = setInterval(tick, 150);
    return () => clearInterval(id);
  }, [
    session?.id,
    session?.round,
    session?.stage,
    session?.deadline,
    currentPrompt,
    landAnswer,
  ]);

  function cancelPendingCheck() {
    submissionSequence.current += 1;
    pendingSubmission.current = null;
    pausedClock.current = null;
    setAIWaiting(false);
  }
  function backupData() {
    return {
      version: 1,
      history,
      customPrompts,
      learnedAnswers: exportLearnedBank(learnedBank),
    };
  }
  function startDive(options?: {
    mode?: Mode;
    seed?: string;
    categories?: Category[];
    timer?: number;
    promptIds?: string[];
  }) {
    const nextMode = options?.mode ?? mode;
    const nextCategories =
      nextMode === "daily" ? CATEGORIES : (options?.categories ?? categories);
    const nextTimer =
      nextMode === "daily"
        ? 25
        : nextMode === "practice"
          ? 0
          : (options?.timer ?? timer);
    const explicitSeed =
      options?.seed ?? (nextMode === "daily" ? undefined : seedInput.trim());
    let seed =
      options?.seed ??
      (nextMode === "daily"
        ? `daily-${localDateKey()}`
        : seedInput.trim() || randomSeed());
    const pool = nextMode === "daily" ? builtInPrompts : allPrompts;
    const eligible = pool.filter((prompt) =>
      nextCategories.includes(prompt.category),
    );
    let selected: Prompt[];
    let nextRotation: PromptRotation | undefined;
    try {
      if (options?.promptIds) {
        selected = options.promptIds
          .map((id) => promptMap.get(id))
          .filter((prompt): prompt is Prompt => !!prompt);
      } else if (nextMode === "daily" || explicitSeed) {
        selected =
          decodeDrawSeed(seed, eligible) ??
          selectPrompts(pool, nextCategories, seed);
      } else {
        const draw = drawFreshPrompts(pool, nextCategories, seed, {
          seenPromptIds:
            rotation.seenByCategories[rotationCategoryKey(nextCategories)] ??
            rotation.recentPromptIds,
          recentPromptIds: rotation.recentPromptIds,
        });
        selected = draw.prompts;
        if (selected.length === 7) {
          seed = encodeDrawSeed(eligible, selected);
          nextRotation = rememberPromptDraw(
            rotation,
            nextCategories,
            selected.map((prompt) => prompt.id),
            draw.seenPromptIds,
          );
        }
      }
    } catch (failure) {
      setToast(
        failure instanceof Error
          ? failure.message
          : "This replay could not be loaded.",
      );
      return;
    }
    if (selected.length !== 7) {
      setToast(
        "Select categories containing at least seven prompts to start a full dive.",
      );
      return;
    }
    cancelPendingCheck();
    nextRotation ??= rememberPromptDraw(
      rotation,
      nextCategories,
      selected.map((prompt) => prompt.id),
      [
        ...(rotation.seenByCategories[rotationCategoryKey(nextCategories)] ??
          rotation.recentPromptIds),
        ...selected.map((prompt) => prompt.id),
      ],
    );
    setRotation(nextRotation);
    try {
      localStorage.setItem(ROTATION_KEY, JSON.stringify(nextRotation));
    } catch {
      /* In-memory rotation still prevents repeats for this visit. */
    }
    // A replay code is consumed once. Dive Again starts a fresh random expedition.
    setSeedInput("");
    const next: Session = {
      id: randomSeed(),
      date: new Date().toISOString(),
      mode: nextMode,
      seed,
      categories: nextCategories,
      timer: nextTimer,
      promptIds: selected.map((p) => p.id),
      round: 0,
      results: [],
      stage: "question",
      deadline: nextTimer ? Date.now() + nextTimer * 1000 : null,
    };
    setSession(next);
    setSeconds(nextTimer);
    setGuess("");
    setError("");
    setCorrections([]);
    setCanRetryAI(false);
    setView("dive");
    setModal(null);
  }
  async function submitGuess(event: React.FormEvent, retry = false) {
    event.preventDefault();
    if (
      !currentPrompt ||
      !session ||
      session.stage !== "question" ||
      pendingSubmission.current
    )
      return;
    const expected = { sessionId: session.id, round: session.round };
    if (session.deadline !== null && Date.now() >= session.deadline) {
      landAnswer(
        {
          promptId: currentPrompt.id,
          input: "",
          answer: null,
          score: 0,
          timedOut: true,
          corrected: false,
        },
        expected,
      );
      return;
    }
    const input = guess.trim();
    if (!input) {
      setError("Name something first, or skip this prompt.");
      return;
    }
    const constraintError = checkPromptConstraints(currentPrompt, input);
    if (constraintError) {
      setError(constraintError);
      setCorrections(suggestAnswerCorrections(currentPrompt, input));
      setCanRetryAI(false);
      return;
    }
    const original = basePrompts.find(
      (prompt) => prompt.id === currentPrompt.id,
    )!;
    const curated = matchExactAnswer(original, input);
    const dictionary = curated
      ? null
      : matchDictionaryAnswer(currentPrompt, input);
    const learned =
      curated || dictionary ? null : matchExactAnswer(currentPrompt, input);
    const exact = curated ?? dictionary ?? learned;
    if (exact) {
      landAnswer(
        {
          promptId: currentPrompt.id,
          input,
          answer: exact.name,
          score: exact.score,
          timedOut: false,
          corrected: false,
          ...(learned ? { ai: true } : {}),
        },
        expected,
      );
      return;
    }
    // Availability badges are advisory. A stale status must never turn the
    // local bank into a whitelist: every submitted unlisted answer reaches Jev.
    setCorrections([]);
    setCanRetryAI(false);
    const token = ++submissionSequence.current;
    pendingSubmission.current = { token, ...expected };
    const waitStarted = Date.now();
    const submittedDeadline = session.deadline;
    pausedClock.current = {
      key: `${session.id}:${session.round}`,
      deadline: null,
    };
    setAIWaiting(true);
    setError("");
    const stillCurrent = () => {
      const active = sessionRef.current;
      return (
        pendingSubmission.current?.token === token &&
        active?.id === expected.sessionId &&
        active.round === expected.round &&
        active.stage === "question"
      );
    };
    const allowAnotherAnswer = (message: string) => {
      if (!stillCurrent()) return;
      const restoredDeadline =
        submittedDeadline === null
          ? null
          : submittedDeadline + (Date.now() - waitStarted);
      pausedClock.current = {
        key: `${expected.sessionId}:${expected.round}`,
        deadline: restoredDeadline,
      };
      pendingSubmission.current = null;
      setAIWaiting(false);
      if (restoredDeadline !== null)
        setSeconds(
          Math.max(0, Math.ceil((restoredDeadline - Date.now()) / 1000)),
        );
      setSession((previous) =>
        previous?.id === expected.sessionId &&
        previous.round === expected.round &&
        previous.stage === "question"
          ? { ...previous, deadline: restoredDeadline }
          : previous,
      );
      setError(message);
      answerRef.current?.focus();
    };
    try {
      const result = await aiClientRef.current.judge(currentPrompt, input, {
        retry,
      });
      setAIStatus({
        enabled: true,
        model: aiStatus?.model || "Jev",
        version: 1,
      });
      if (!stillCurrent()) return;
      if (result.status === "accepted" && result.answer) {
        const canonical = result.answer;
        setLearnedBank((previous) =>
          learnAnswer(previous, currentPrompt, {
            name: canonical,
            score: result.score as 10 | 15 | 30 | 60 | 85 | 100,
            ...(canonical !== input ? { aliases: [input] } : {}),
          }),
        );
        pendingSubmission.current = null;
        setAIWaiting(false);
        landAnswer(
          {
            promptId: currentPrompt.id,
            input,
            answer: canonical,
            score: result.score,
            timedOut: false,
            corrected: false,
            ai: true,
          },
          expected,
        );
      } else {
        setCorrections(suggestAnswerCorrections(currentPrompt, input));
        setCanRetryAI(result.status === "uncertain");
        allowAnotherAnswer(
          result.status === "rejected"
            ? "Jev judged that answer outside this prompt’s scope. Try another answer. Your unused time is preserved."
            : "Jev couldn’t verify that answer confidently. It wasn’t marked wrong; try another answer. Your unused time is preserved.",
        );
      }
    } catch (failure) {
      if (!stillCurrent()) return;
      setCorrections(suggestAnswerCorrections(currentPrompt, input));
      setCanRetryAI(true);
      allowAnotherAnswer(
        `${describeAIError(failure)} Your unused time is preserved.`,
      );
    }
  }
  function nextRound() {
    if (
      !session ||
      session.stage !== "reveal" ||
      isDescending ||
      descent.depth < depth
    )
      return;
    cancelPendingCheck();
    if (session.round === 6) {
      const record: DiveRecord = {
        id: session.id,
        date: session.date,
        seed: session.seed,
        mode: session.mode,
        categories: session.categories,
        timer: session.timer,
        results: session.results,
        score: totalScore,
      };
      setHistory((prev) =>
        [record, ...prev.filter((h) => h.id !== record.id)].slice(0, 5000),
      );
      setSession({ ...session, stage: "finished" });
    } else {
      setSession({
        ...session,
        round: session.round + 1,
        stage: "question",
        deadline: session.timer ? Date.now() + session.timer * 1000 : null,
      });
      setSeconds(session.timer);
    }
    setGuess("");
    setError("");
    setCorrections([]);
    setCanRetryAI(false);
  }
  function goTo(next: View) {
    if (session && session.stage !== "finished" && next !== "dive") {
      setToast(
        "Finish your dive first. The clock keeps running while a prompt is open.",
      );
      return;
    }
    setView(next);
  }
  async function shareDive() {
    if (!session) return;
    const text = `KRILLION · ${modeNames[session.mode]}\n${session.results.map((r) => (r.score >= 85 ? "🟪" : r.score >= 60 ? "🟩" : r.score > 0 ? "🟦" : "⬛")).join("")}\n${totalScore}/700 · ${depth.toLocaleString()}m\nSeed: ${session.seed}\nCategories: ${session.categories.join(", ")} · ${session.timer ? `${session.timer}s` : "Untimed"}\nLocal curated bank v1${customPrompts.some((p) => session.promptIds.includes(p.id)) ? " · includes custom prompts" : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast(
        "Dive copied. Share the seed, categories, and timer to challenge a friend.",
      );
    } catch {
      download("krillion-result.txt", text, "text/plain");
      setToast("Result saved as a text file.");
    }
  }
  function download(name: string, content: string, type = "application/json") {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(file: File | undefined, bankOnly: boolean) {
    if (!file) return;
    if (file.size > 10_000_000) {
      setToast("Please choose a JSON file smaller than 10 MB.");
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      if (bankOnly) {
        const prompts = validateCustomPrompts(data);
        const merged = mergeCustomPrompts(customPrompts, prompts);
        setCustomPrompts(merged);
        setToast(`Added ${prompts.length} custom prompts to your local bank.`);
      } else {
        const save = validateSave(data);
        const importedLearned =
          data.learnedAnswers === undefined
            ? {}
            : validateLearnedBank(data.learnedAnswers);
        const merged = mergeCustomPrompts(save.customPrompts, customPrompts);
        if (unreadableSave)
          localStorage.setItem(
            `${SAVE_KEY}-recovery-${Date.now()}`,
            unreadableSave,
          );
        setHistory((prev) =>
          [
            ...new Map(
              [...save.history, ...prev].map((h) => [h.id, h]),
            ).values(),
          ]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5000),
        );
        setCustomPrompts(merged);
        setLearnedBank((previous) =>
          mergeLearnedBanks(previous, importedLearned),
        );
        setLearnedStorageBlocked(false);
        setStorageBlocked(false);
        setUnreadableSave("");
        setToast("Backup merged with your local logbook.");
      }
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : "This file could not be imported.",
      );
    }
  }
  function saveCustom(event: React.FormEvent) {
    event.preventDefault();
    setCustomError("");
    try {
      const answers = customAnswers
        .split("\n")
        .filter((s) => s.trim())
        .map((line, i) => {
          const [name, score, aliases] = line.split("|").map((s) => s.trim());
          if (!name || !score)
            throw new Error(
              `Line ${i + 1}: use Answer | Score | optional aliases.`,
            );
          return {
            name,
            score: Number(score),
            ...(aliases
              ? {
                  aliases: aliases
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }
              : {}),
          };
        });
      const prompts = validateCustomPrompts([
        {
          id: randomSeed(),
          category: customCategory,
          prompt: customText,
          note: customNote,
          answers,
        },
      ]);
      setCustomPrompts(mergeCustomPrompts(customPrompts, prompts));
      setCustomText("");
      setCustomNote("");
      setCustomAnswers("");
      setModal(null);
      setToast(
        "Custom prompt added. It is now available in unlimited dives and practice.",
      );
    } catch (err) {
      setCustomError(
        err instanceof Error ? err.message : "Check your prompt and answers.",
      );
    }
  }

  const filteredPrompts = allPrompts.filter(
    (p) =>
      (guideCategory === "All" || p.category === guideCategory) &&
      `${p.prompt} ${p.category}`
        .toLowerCase()
        .includes(guideSearch.toLowerCase()),
  );
  const lastResult = session?.results[session.round];
  const isPlaying = !!session && session.stage !== "finished";

  return (
    <div className={`app ${prefersReducedMotion ? "reduce-motion" : ""}`}>
      <header className="app-header">
        <button
          className="wordmark"
          onClick={() => goTo("dive")}
          aria-label="Krillion home"
        >
          <span className="logo-mark">
            <Waves size={24} />
          </span>
          <span>
            KRILLION<small>THE LOCAL DIVE</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button
            className={view === "dive" ? "active" : ""}
            onClick={() => goTo("dive")}
          >
            <Waves size={16} />
            <span>Dive</span>
          </button>
          <button
            className={view === "guide" ? "active" : ""}
            onClick={() => goTo("guide")}
          >
            <BookOpen size={16} />
            <span>Field guide</span>
          </button>
          <button
            className={view === "logbook" ? "active" : ""}
            onClick={() => goTo("logbook")}
          >
            <History size={16} />
            <span>Logbook</span>
          </button>
        </nav>
        <div className="header-tools">
          <span className="local-status">
            <i />
            LOCAL · AD FREE
          </span>
          <span
            className={`ai-status ${aiStatus?.enabled ? "ready" : "offline"}`}
            title={
              aiStatus?.enabled
                ? `Jev checks unlisted answers · ${aiStatus.model}`
                : "Curated and previously learned answers work locally"
            }
          >
            <Sparkles size={12} />{" "}
            {aiStatus?.enabled ? "JEV READY" : "LOCAL BANK"}
          </span>
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={() => setModal("help")}
          >
            <HelpCircle size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Settings and backups"
            onClick={() => setModal("settings")}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {view === "dive" && (
        <main
          className={`dive-world ${session ? "in-session" : ""} ${session?.stage === "finished" ? "completed" : ""} ${descent.depth > 100 ? "submerged" : ""} ${isDescending ? "is-descending" : ""}`}
        >
          <Ocean
            descent={descent}
            active={!!session}
            vehicle={<Submarine />}
            reducedMotion={prefersReducedMotion}
          />
          <DepthRuler depth={descent.depth} />
          <div className="hud">
            <div className="hud-box">
              <span>DEPTH</span>
              <strong>
                {descent.depth.toLocaleString()}
                <em>m</em>
              </strong>
              <small>
                {descent.depth < 200
                  ? "SUNLIGHT ZONE"
                  : descent.depth < 1000
                    ? "TWILIGHT ZONE"
                    : descent.depth < 4000
                      ? "MIDNIGHT ZONE"
                      : descent.depth < 6000
                        ? "ABYSSAL ZONE"
                        : "THE TRENCH"}
              </small>
            </div>
            <div className="hud-center">
              {session ? (
                <>
                  <div
                    className="round-dots"
                    aria-label={`Round ${session.round + 1} of 7`}
                  >
                    {Array.from({ length: 7 }, (_, i) => (
                      <span
                        key={i}
                        className={
                          session.stage === "finished" ||
                          i < session.results.length
                            ? "done"
                            : i === session.round
                              ? "current"
                              : ""
                        }
                        style={
                          i < session.results.length
                            ? {
                                background: scoreColor(
                                  session.results[i].score,
                                ),
                              }
                            : {}
                        }
                      />
                    ))}
                  </div>
                  <span>
                    {isDescending
                      ? `DESCENDING · +${lastDrop.toLocaleString()}m`
                      : session.stage === "finished"
                        ? "DIVE COMPLETE"
                        : `PROMPT ${session.round + 1} OF 7`}
                  </span>
                </>
              ) : (
                <>
                  <span className="ocean-coordinates">
                    35° 04′ N &nbsp; 141° 12′ E
                  </span>
                  <span>UNLIMITED WATERS AHEAD</span>
                </>
              )}
            </div>
            <div className="hud-box score-box">
              <span>SCORE</span>
              <strong>
                <AnimatedNumber
                  value={totalScore}
                  duration={850}
                  reducedMotion={prefersReducedMotion}
                />
                <em>/700</em>
              </strong>
              <small>
                {session
                  ? modeNames[session.mode].toUpperCase()
                  : "YOUR NEXT DISCOVERY"}
              </small>
            </div>
          </div>

          {!session && (
            <section className="home-content">
              <div className="home-intro">
                <p className="eyebrow">A RARE-ANSWER TRIVIA EXPEDITION</p>
                <h1>
                  KRILLION<span>↓</span>
                </h1>
                <p className="tagline">
                  Obvious answers float.
                  <br />
                  <b>The good ones take you deeper.</b>
                </p>
              </div>
              <div className="hero-sub">
                <Submarine />
                <span>small sub. big possibilities.</span>
              </div>
              <div className="start-panel pixel-panel">
                <div
                  className="mode-tabs"
                  aria-label="Game mode"
                  data-mode={mode}
                >
                  {(["unlimited", "daily", "practice"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      className={mode === m ? "selected" : ""}
                      aria-pressed={mode === m}
                      onClick={() => setMode(m)}
                    >
                      {m === "unlimited" ? (
                        <InfinityIcon size={17} />
                      ) : m === "daily" ? (
                        <Globe2 size={15} />
                      ) : (
                        <Leaf size={15} />
                      )}{" "}
                      {modeNames[m]}
                    </button>
                  ))}
                </div>
                <div className="mode-description" key={mode}>
                  <h2>
                    {mode === "unlimited"
                      ? "The ocean has no run limit."
                      : mode === "daily"
                        ? "A fresh expedition, every day."
                        : "Take your time. Find your depth."}
                  </h2>
                  <p>
                    {mode === "unlimited"
                      ? "Fresh prompts before repeats. Seven questions per dive. As many dives as you like."
                      : mode === "daily"
                        ? `${ready ? new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "Today"} · Seven fixed prompts from the original local bank. Replay freely.`
                        : "No clock. No rush. Explore a category and learn something new."}
                  </p>
                </div>
                <button
                  className="primary-button start-button"
                  onClick={() => startDive()}
                  disabled={!ready || (mode !== "daily" && availableCount < 7)}
                >
                  BEGIN DESCENT <ArrowDown size={18} />
                </button>
                <div className="setup-summary">
                  <span>7 PROMPTS</span>
                  <i>·</i>
                  <span>
                    {mode === "practice" ||
                    (mode === "unlimited" && timer === 0)
                      ? "UNTIMED"
                      : `${mode === "daily" ? 25 : timer} SECONDS EACH`}
                  </span>
                  <button
                    onClick={() => setShowSetup(!showSetup)}
                    aria-expanded={showSetup}
                  >
                    <ListFilter size={13} />
                    {showSetup ? "Close" : "Customize"}
                    <ChevronDown
                      size={12}
                      className={showSetup ? "rotate" : ""}
                    />
                  </button>
                </div>
                {showSetup && (
                  <div className="setup-options">
                    {mode === "daily" ? (
                      <p className="muted">
                        Daily dives use all six categories, a 25-second timer,
                        and a fixed date seed. Unlimited and practice let you
                        choose your own settings.
                      </p>
                    ) : (
                      <>
                        <div className="option-row">
                          <label>Time per prompt</label>
                          <div className="segmented">
                            {[25, 45, 0].map((n) => (
                              <button
                                key={n}
                                className={
                                  (mode === "practice" ? 0 : timer) === n
                                    ? "selected"
                                    : ""
                                }
                                aria-pressed={
                                  (mode === "practice" ? 0 : timer) === n
                                }
                                disabled={mode === "practice"}
                                onClick={() => setTimer(n)}
                              >
                                {n ? `${n}s` : "Untimed"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <label className="option-label">
                          Your waters <span>{availableCount} prompts</span>
                        </label>
                        <div className="category-chips">
                          {CATEGORIES.map((c) => (
                            <button
                              key={c}
                              aria-pressed={categories.includes(c)}
                              className={
                                categories.includes(c) ? "selected" : ""
                              }
                              onClick={() =>
                                setCategories((prev) =>
                                  prev.includes(c)
                                    ? prev.length === 1
                                      ? prev
                                      : prev.filter((x) => x !== c)
                                    : [...prev, c],
                                )
                              }
                            >
                              {categories.includes(c) && <Check size={12} />}{" "}
                              {c}
                            </button>
                          ))}
                        </div>
                        <label className="option-label" htmlFor="seed-input">
                          Replay a seed <span>Optional</span>
                        </label>
                        <input
                          id="seed-input"
                          className="small-input"
                          placeholder="Leave blank for a new expedition"
                          maxLength={120}
                          value={seedInput}
                          onChange={(e) => setSeedInput(e.target.value)}
                        />
                        {availableCount < 7 && (
                          <p className="error-text">
                            Select more categories: a full dive needs seven
                            prompts.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="home-bottom">
                <div>
                  <Sparkles size={15} />
                  <span>
                    <b>{allPrompts.length}</b> local prompts
                  </span>
                </div>
                <span className="tiny-divider" />
                <div>
                  <BookOpen size={15} />
                  <span>
                    <b>
                      {basePrompts
                        .reduce((n, p) => n + p.answers.length, 0)
                        .toLocaleString()}
                    </b>{" "}
                    curated answers
                  </span>
                </div>
                <span className="tiny-divider" />
                <div>
                  <Waves size={15} />
                  <span>
                    <b>{(best * 10).toLocaleString()}m</b> personal best
                  </span>
                </div>
              </div>
              <p className="local-footnote">
                {dictionaryWordCount.toLocaleString()} DICTIONARY WORDS. NO ADS.
                JUST YOU AND THE DEEP.
              </p>
            </section>
          )}

          {session && session.stage === "question" && currentPrompt && (
            <section
              className={`play-content ${aiWaiting ? "is-checking" : ""}`}
              key={`${session.id}-${session.round}`}
            >
              <div className="prompt-kicker">
                <span>{currentPrompt.category.toUpperCase()}</span>
                <span>
                  {session.timer
                    ? `${session.timer} SECOND DIVE`
                    : session.mode === "practice"
                      ? "UNTIMED PRACTICE"
                      : "UNTIMED DIVE"}
                </span>
              </div>
              <h1 className="question-title">{currentPrompt.prompt}</h1>
              <p className="question-subtitle">
                Think past the obvious. Rare answers sink deeper.
              </p>
              <div className="play-card pixel-panel">
                <div className="timer-row">
                  <span>YOUR ANSWER</span>
                  <strong
                    className={session.timer && seconds <= 5 ? "urgent" : ""}
                  >
                    {session.timer ? (
                      <>
                        {seconds}
                        <small>s</small>
                      </>
                    ) : (
                      <>
                        <InfinityIcon size={22} />
                        <small>take your time</small>
                      </>
                    )}
                  </strong>
                </div>
                {session.timer > 0 && (
                  <div
                    className="timer-bar"
                    role="progressbar"
                    aria-label="Time remaining"
                    aria-valuemin={0}
                    aria-valuemax={session.timer}
                    aria-valuenow={seconds}
                  >
                    <span
                      style={{
                        width: `${(seconds / session.timer) * 100}%`,
                        background: seconds <= 5 ? "#ed9c88" : undefined,
                      }}
                    />
                  </div>
                )}
                <form onSubmit={submitGuess}>
                  <label className="sr-only" htmlFor="answer-input">
                    Your answer
                  </label>
                  <input
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    id="answer-input"
                    ref={answerRef}
                    value={guess}
                    disabled={aiWaiting}
                    maxLength={200}
                    onChange={(e) => {
                      setGuess(e.target.value);
                      setError("");
                      setCorrections([]);
                      setCanRetryAI(false);
                    }}
                    placeholder="Something less obvious…"
                    aria-describedby={error ? "answer-error" : "answer-tip"}
                  />
                  {aiWaiting ? (
                    <p
                      className="answer-tip ai-checking"
                      id="answer-tip"
                      role="status"
                    >
                      <CheckingSonar reducedMotion={prefersReducedMotion} /> Jev
                      is checking this answer. Your clock is briefly paused.
                    </p>
                  ) : error ? (
                    <p role="alert" className="error-text" id="answer-error">
                      {error}
                    </p>
                  ) : (
                    <p className="answer-tip" id="answer-tip">
                      Known answers and dictionary words score instantly. Jev
                      checks other submitted answers. Your spelling is never
                      changed automatically. Press <kbd>Enter ↵</kbd> to lock it
                      in.
                    </p>
                  )}
                  {!aiWaiting && error && corrections.length > 0 && (
                    <div className="answer-corrections">
                      <span>Spelling suggestions — choose one to use:</span>
                      <div>
                        {corrections.map((answer) => (
                          <button
                            type="button"
                            key={answer.name}
                            onClick={() => {
                              setGuess(answer.name);
                              setError("");
                              setCorrections([]);
                              setCanRetryAI(false);
                              answerRef.current?.focus();
                            }}
                          >
                            {answer.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!aiWaiting && error && canRetryAI && (
                    <button
                      type="button"
                      className="ai-retry"
                      onClick={(event) => void submitGuess(event, true)}
                    >
                      Retry AI check
                    </button>
                  )}
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={aiWaiting}
                    aria-busy={aiWaiting}
                  >
                    {aiWaiting ? "CHECKING ANSWER…" : "LOCK IT IN"}{" "}
                    <ArrowDown size={17} />
                  </button>
                </form>
                <div className="play-card-bottom">
                  <button
                    disabled={aiWaiting}
                    onClick={() =>
                      landAnswer({
                        promptId: currentPrompt.id,
                        input: guess,
                        answer: null,
                        score: 0,
                        timedOut: false,
                        corrected: false,
                      })
                    }
                  >
                    Skip prompt <ChevronRight size={14} />
                  </button>
                  <button onClick={() => setModal("leave")}>End dive</button>
                </div>
              </div>
              <p className="scope-teaser">{currentPrompt.note}</p>
              <div className="swimming-sub">
                <Submarine small />
              </div>
            </section>
          )}

          {session &&
            session.stage === "reveal" &&
            currentPrompt &&
            lastResult && (
              <section
                className="reveal-content"
                key={`${session.id}:${session.round}:reveal`}
                data-tier={
                  lastResult.score >= 85
                    ? "rare"
                    : lastResult.score > 0
                      ? "found"
                      : "missed"
                }
              >
                <RevealEffects
                  score={lastResult.score}
                  roundKey={`${session.id}:${session.round}`}
                  reducedMotion={prefersReducedMotion}
                />
                <p className="sr-only gm-announcement" role="status">
                  {lastResult.answer
                    ? `${lastResult.answer}. ${lastResult.score} points.`
                    : lastResult.timedOut
                      ? "Time ran out. Zero points."
                      : "Prompt skipped. Zero points."}
                </p>
                <p className="eyebrow">
                  {lastResult.timedOut
                    ? "THE CLOCK REACHED YOU FIRST"
                    : lastResult.score
                      ? "SOMETHING GOOD JUST LANDED"
                      : "ANOTHER DISCOVERY AWAITS"}
                </p>
                <h1 style={{ color: scoreColor(lastResult.score) }}>
                  {scoreLabel(lastResult.score).toUpperCase()}
                </h1>
                <p className="landed-answer">
                  {lastResult.answer ??
                    (lastResult.timedOut
                      ? "Out of time."
                      : "Nothing landed this round.")}
                </p>
                {lastResult.ai && (
                  <p className="ai-estimate">
                    <Sparkles size={13} /> AI familiarity estimate · saved to
                    the answer bank
                  </p>
                )}
                {lastResult.corrected && (
                  <p className="correction-note">
                    Spelling corrected from “{lastResult.input}”.
                  </p>
                )}
                <div
                  className="points-display"
                  style={{ color: scoreColor(lastResult.score) }}
                >
                  <div className="points-value">
                    <AnimatedNumber
                      value={lastResult.score}
                      prefix="+"
                      duration={900}
                      animateOnMount
                      reducedMotion={prefersReducedMotion}
                    />
                  </div>
                  <span>POINTS</span>
                </div>
                <p className="descent-label">
                  {lastResult.score
                    ? `${(lastResult.score * 10).toLocaleString()} metres closer to the unknown.`
                    : "The best finds are still below you."}
                </p>
                <div className="reveal-details pixel-panel">
                  <p className="reveal-prompt">{currentPrompt.prompt}</p>
                  <AnswerBank prompt={currentPrompt} />
                </div>
                <button
                  className="primary-button next-button"
                  ref={nextRef}
                  onClick={nextRound}
                  disabled={!descentComplete}
                  aria-busy={isDescending}
                >
                  {isDescending
                    ? `DESCENDING · +${lastDrop.toLocaleString()}m`
                    : session.round === 6
                      ? "SEE YOUR DIVE"
                      : "KEEP DESCENDING"}{" "}
                  <ArrowDown size={18} />
                </button>
                <p className="keyboard-hint" role="status">
                  {isDescending
                    ? "Hold tight. The ocean is moving past you."
                    : "Press Enter to continue"}
                </p>
              </section>
            )}

          {session && session.stage === "finished" && (
            <section className="results-content" key={`${session.id}:complete`}>
              <CompletionEffects
                score={totalScore}
                sessionId={session.id}
                reducedMotion={prefersReducedMotion}
              />
              <p className="sr-only gm-announcement" role="status">
                Expedition complete. {totalScore} points.{" "}
                {depth.toLocaleString()} metres.
              </p>
              <p className="eyebrow">EXPEDITION COMPLETE</p>
              <h1>
                {totalScore >= 500
                  ? "INTO THE ABYSS."
                  : totalScore >= 300
                    ? "DEEPER LOOKS GOOD."
                    : "A GOOD DAY TO DIVE."}
              </h1>
              <div className="final-depth">
                <b className="final-value">
                  <AnimatedNumber
                    value={depth}
                    duration={1500}
                    animateOnMount
                    reducedMotion={prefersReducedMotion}
                  />
                </b>
                <span>m</span>
              </div>
              <p className="result-message">
                {totalScore >= 500
                  ? "Some extraordinary finds down there."
                  : totalScore >= 300
                    ? "You have a knack for the less obvious."
                    : "Every dive adds something to your field guide."}{" "}
                Ready for another?
              </p>
              <div className="result-actions">
                <button
                  className="primary-button"
                  onClick={() =>
                    startDive({
                      mode: session.mode,
                      categories: session.categories,
                      timer: session.timer,
                    })
                  }
                >
                  DIVE AGAIN <RotateCcw size={16} />
                </button>
                <button className="secondary-button" onClick={shareDive}>
                  <Share2 size={16} /> SHARE RESULT
                </button>
              </div>
              <div className="round-recap pixel-panel">
                <div className="recap-heading">
                  <h2>YOUR DISCOVERIES</h2>
                  <span>{totalScore} / 700 PTS</span>
                </div>
                {session.results.map((r, i) => {
                  const p = promptMap.get(r.promptId);
                  return (
                    <details
                      className="recap-round"
                      key={`${r.promptId}-${i}`}
                      style={{ "--recap-index": i } as React.CSSProperties}
                    >
                      <summary>
                        <span className="round-number">0{i + 1}</span>
                        <div>
                          <span>{p?.prompt ?? "Custom prompt"}</span>
                          <b>
                            {r.answer ??
                              (r.timedOut ? "Out of time" : "Skipped")}
                          </b>
                        </div>
                        <span
                          className="recap-score"
                          style={{ color: scoreColor(r.score) }}
                        >
                          +{r.score}
                          <ChevronDown size={13} />
                        </span>
                      </summary>
                      {p && <AnswerBank prompt={p} />}
                    </details>
                  );
                })}
              </div>
              <div className="result-seed">
                SEED: {session.seed} · {modeNames[session.mode].toUpperCase()} ·{" "}
                {session.timer ? `${session.timer}s` : "UNTIMED"}
              </div>
              <button
                className="text-button return-home"
                onClick={() => {
                  setSession(null);
                  setView("dive");
                }}
              >
                Back to the surface <ArrowRight size={14} />
              </button>
            </section>
          )}
          <div className="water-caption left-caption">
            {depth > 2000
              ? "THE LIGHT FADES. THE FINDS GET BETTER."
              : "THE LESS OBVIOUS IS DOWN THERE."}
          </div>
          <div className="water-caption right-caption">
            ONE POINT = TEN METRES
          </div>
        </main>
      )}

      {view === "guide" && (
        <main className="library-page">
          <div className="page-heading">
            <div>
              <p className="eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY DOWN</p>
              <h1>The field guide.</h1>
              <p>
                {allPrompts.length} prompts ·{" "}
                {dictionaryWordCount.toLocaleString()} dictionary words.
              </p>
            </div>
            <button
              className="primary-button compact"
              onClick={() => setModal("custom")}
            >
              <Plus size={16} /> ADD A PROMPT
            </button>
          </div>
          <div className="guide-notice">
            <BookOpen size={18} />
            <p>
              Curiosity welcome. Spoilers ahead. Open a prompt to explore its
              local answer bank and score estimates. Broad categories contain a
              curated selection; they are not exhaustive. Accepted AI checks
              grow this bank with answers you and other players submit.
            </p>
          </div>
          <div className="library-filters">
            <input
              type="search"
              className="small-input"
              placeholder="Search prompts…"
              aria-label="Search prompts"
              value={guideSearch}
              onChange={(e) => setGuideSearch(e.target.value)}
            />
            <select
              value={guideCategory}
              onChange={(e) => setGuideCategory(e.target.value)}
              aria-label="Filter category"
            >
              <option>All</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="guide-grid">
            {filteredPrompts.map((p, index) => (
              <article
                className="guide-card"
                key={p.id}
                style={
                  {
                    "--entry-delay": `${Math.min(index, 6) * 30}ms`,
                  } as React.CSSProperties
                }
              >
                <div className="guide-card-top">
                  <span className="category-label">
                    {p.category.toUpperCase()}
                  </span>
                  {p.id.startsWith("custom-") && (
                    <span className="custom-badge">YOUR PROMPT</span>
                  )}
                </div>
                <h2>{p.prompt}</h2>
                <AnswerBank prompt={p} />
              </article>
            ))}
          </div>
          {!filteredPrompts.length && (
            <div className="empty-state">
              <BookOpen size={32} />
              <h2>No discoveries here yet.</h2>
              <p>Try a different search or add your own prompt.</p>
            </div>
          )}
          <p className="page-fineprint">
            Independent content with curated and AI familiarity estimates, not
            official Krillion scoring or measured player statistics.
          </p>
        </main>
      )}

      {view === "logbook" && (
        <main className="library-page logbook-page">
          <div className="page-heading">
            <div>
              <p className="eyebrow">THE PLACES YOUR MIND HAS TAKEN YOU</p>
              <h1>Your logbook.</h1>
              <p>Saved in this browser. Every expedition has a story.</p>
            </div>
            <button
              className="secondary-button compact"
              onClick={() =>
                download(
                  `krillion-backup-${localDateKey()}.json`,
                  JSON.stringify(backupData(), null, 2),
                )
              }
            >
              <Download size={16} /> EXPORT BACKUP
            </button>
          </div>
          <div className="stat-grid">
            <div>
              <span>DIVES COMPLETED</span>
              <strong>
                <AnimatedNumber
                  value={history.length}
                  animateOnMount
                  reducedMotion={prefersReducedMotion}
                />
              </strong>
            </div>
            <div>
              <span>DEEPEST DIVE</span>
              <strong>
                <AnimatedNumber
                  value={best * 10}
                  duration={1100}
                  animateOnMount
                  reducedMotion={prefersReducedMotion}
                />
                <small>m</small>
              </strong>
            </div>
            <div>
              <span>AVERAGE DEPTH</span>
              <strong>
                <AnimatedNumber
                  value={
                    history.length
                      ? Math.round(
                          (history.reduce((s, h) => s + h.score, 0) /
                            history.length) *
                            10,
                        )
                      : 0
                  }
                  duration={1000}
                  animateOnMount
                  reducedMotion={prefersReducedMotion}
                />
                <small>m</small>
              </strong>
            </div>
            <div>
              <span>HIDDEN GEMS</span>
              <strong>
                <AnimatedNumber
                  value={
                    history
                      .flatMap((h) => h.results)
                      .filter((r) => r.score === 100).length
                  }
                  animateOnMount
                  reducedMotion={prefersReducedMotion}
                />
              </strong>
            </div>
          </div>
          {history.length ? (
            <div className="history-list">
              {history.map((h, index) => (
                <article
                  key={h.id}
                  style={
                    {
                      "--entry-delay": `${Math.min(index, 6) * 30}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div className="history-icon">
                    <Waves size={21} />
                  </div>
                  <div className="history-description">
                    <h2>{modeNames[h.mode]}</h2>
                    <p>
                      {new Date(h.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {h.timer ? `${h.timer}s` : "Untimed"}
                    </p>
                    <span className="history-seed">{h.seed}</span>
                  </div>
                  <div className="history-score">
                    <strong>
                      {(h.score * 10).toLocaleString()}
                      <small>m</small>
                    </strong>
                    <span>{h.score}/700 points</span>
                  </div>
                  <button
                    className="secondary-button compact"
                    onClick={() =>
                      startDive({
                        mode: h.mode,
                        seed: h.seed,
                        categories: h.categories,
                        timer: h.timer,
                        promptIds: h.results.map((r) => r.promptId),
                      })
                    }
                  >
                    <RotateCcw size={14} />
                    <span>REPLAY</span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Submarine />
              <h2>Uncharted waters.</h2>
              <p>
                Your completed dives will appear here.
                <br />
                The ocean is a good place to start.
              </p>
              <button
                className="primary-button compact"
                onClick={() => {
                  setSession(null);
                  setView("dive");
                }}
              >
                TAKE YOUR FIRST DIVE <ArrowDown size={16} />
              </button>
            </div>
          )}
        </main>
      )}

      <dialog
        ref={dialogRef}
        className={`modal ${modal === "custom" ? "wide" : ""}`}
        aria-labelledby="dialog-title"
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <div className="modal-inner">
          <button
            className="icon-button close-modal"
            onClick={() => setModal(null)}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
          {modal === "help" && (
            <>
              <p className="eyebrow">A QUICK BRIEFING</p>
              <h2 id="dialog-title">How deep can you go?</h2>
              <p>
                Seven prompts. Name one thing for each. The less obvious your
                answer, the deeper you descend.
              </p>
              <div className="help-steps">
                <div>
                  <span>01</span>
                  <p>
                    <b>Think beyond the first answer.</b> A familiar answer gets
                    you started. A hidden gem takes you 1,000 metres down.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <b>Lock it in before time runs out.</b> Known answers score
                    instantly. When Jev is ready, an unlisted answer gets an AI
                    check. The clock briefly pauses for a submitted check; you
                    keep your unused time if it cannot be accepted.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    <b>Keep the discoveries.</b> Explore the bank after every
                    answer, then dive again. There are no run limits.
                  </p>
                </div>
              </div>
              <div className="score-legend">
                {[10, 15, 30, 60, 85, 100].map((n) => (
                  <div key={n}>
                    <span style={{ color: scoreColor(n) }}>
                      {scoreLabel(n)}
                    </span>
                    <b>{n}</b>
                  </div>
                ))}
              </div>
              <p className="modal-note">
                This is an independent local recreation of Krillion. It uses
                original artwork and a separate, finite, expandable answer bank.
                Scores are curated or AI familiarity estimates, not measured
                popularity. Jev judges answers you supply; it does not generate
                words. Accepted checks expand the bank. Daily dives repeat the
                same local prompts for that date; practice is untimed.
              </p>
              <button className="primary-button" onClick={() => setModal(null)}>
                GOT IT. LET’S DIVE. <ArrowDown size={16} />
              </button>
            </>
          )}
          {modal === "settings" && (
            <>
              <p className="eyebrow">YOUR OWN LITTLE OCEAN</p>
              <h2 id="dialog-title">Settings & supplies.</h2>
              <div className="privacy-card">
                <span className="local-status">
                  <i />
                  PROGRESS STAYS LOCAL
                </span>
                <p>
                  Your progress and logbook stay in this browser. Curated and
                  learned answers work offline. When Jev is ready, unlisted
                  answers send only the current prompt, scope, and answer
                  through this site’s server to TypeSafe for validity and rarity
                  estimates. Accepted answers join the shared answer bank. No
                  browser API key, account, or ads.
                </p>
              </div>
              <label className="motion-setting">
                <span>Reduce background motion</span>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => {
                    setReducedMotion(e.target.checked);
                    try {
                      localStorage.setItem(
                        "krillion-motion",
                        e.target.checked ? "reduced" : "full",
                      );
                    } catch {}
                  }}
                />
              </label>
              {unreadableSave && (
                <div className="recovery-note">
                  <p>
                    Your original unreadable save is preserved. Automatic saving
                    is paused until you import a valid backup. You can export
                    this session separately.
                  </p>
                  <button
                    className="secondary-button compact"
                    onClick={() =>
                      download("krillion-original-save.json", unreadableSave)
                    }
                  >
                    DOWNLOAD ORIGINAL SAVE
                  </button>
                </div>
              )}
              <div className="settings-actions">
                <button
                  onClick={() =>
                    download(
                      `krillion-backup-${localDateKey()}.json`,
                      JSON.stringify(backupData(), null, 2),
                    )
                  }
                >
                  <Download size={18} />
                  <span>
                    <b>Export your logbook</b>
                    <small>
                      Back up dives, custom prompts, and learned answers as
                      JSON.
                    </small>
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => importRef.current?.click()}
                  disabled={isPlaying}
                >
                  <Upload size={18} />
                  <span>
                    <b>Import a backup</b>
                    <small>Merge a previous save with this browser.</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => bankRef.current?.click()}
                  disabled={isPlaying}
                >
                  <BookOpen size={18} />
                  <span>
                    <b>Import a question bank</b>
                    <small>Add your own prompts from a JSON array.</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() =>
                    download(
                      "krillion-bank-example.json",
                      JSON.stringify(
                        [
                          {
                            id: "example-oceans",
                            category: "Geography",
                            prompt: "Name one of the five oceans.",
                            note: "Five commonly recognized oceans; example local familiarity scores.",
                            answers: [
                              {
                                name: "Pacific",
                                score: 10,
                                aliases: ["Pacific Ocean"],
                              },
                              {
                                name: "Atlantic",
                                score: 15,
                                aliases: ["Atlantic Ocean"],
                              },
                              {
                                name: "Indian",
                                score: 30,
                                aliases: ["Indian Ocean"],
                              },
                              {
                                name: "Arctic",
                                score: 85,
                                aliases: ["Arctic Ocean"],
                              },
                              {
                                name: "Southern",
                                score: 100,
                                aliases: ["Southern Ocean", "Antarctic Ocean"],
                              },
                            ],
                          },
                        ],
                        null,
                        2,
                      ),
                    )
                  }
                >
                  <Download size={18} />
                  <span>
                    <b>Download bank template</b>
                    <small>A working example you can edit.</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
              {isPlaying && (
                <p className="modal-note">
                  Import is available after your current dive. The prompt timer
                  continues while this dialog is open.
                </p>
              )}
              <p className="modal-note">
                This browser stores up to 5,000 completed dives. Export a backup
                before clearing browser data or changing ports. Shuffled runs
                are unlimited; prompt variety comes from your local bank.
              </p>
            </>
          )}
          {modal === "custom" && (
            <>
              <p className="eyebrow">MAKE THE OCEAN A LITTLE BIGGER</p>
              <h2 id="dialog-title">Add your own prompt.</h2>
              <form className="custom-form" onSubmit={saveCustom}>
                <label>
                  Prompt
                  <input
                    required
                    maxLength={500}
                    placeholder="Name a…"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </label>
                <label>
                  Category
                  <select
                    value={customCategory}
                    onChange={(e) =>
                      setCustomCategory(e.target.value as Category)
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Scope or notes
                  <textarea
                    rows={2}
                    maxLength={1000}
                    placeholder="Explain what counts as an answer."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                  />
                </label>
                <label>
                  Accepted answers
                  <textarea
                    required
                    rows={7}
                    placeholder={
                      "Answer | Score | optional aliases, separated by commas\nPacific | 10 | Pacific Ocean\nSouthern | 100 | Southern Ocean, Antarctic Ocean"
                    }
                    value={customAnswers}
                    onChange={(e) => setCustomAnswers(e.target.value)}
                  />
                </label>
                <p className="modal-note">
                  One answer per line. Scores: 10, 15, 30, 60, 85, or 100. Add
                  common answers as well as rare ones. Your prompt joins
                  unlimited and practice dives.
                </p>
                {customError && (
                  <p role="alert" className="error-text">
                    {customError}
                  </p>
                )}
                <button type="submit" className="primary-button">
                  ADD TO MY OCEAN <Plus size={16} />
                </button>
              </form>
            </>
          )}
          {modal === "leave" && (
            <>
              <p className="eyebrow">RETURN TO THE SURFACE?</p>
              <h2 id="dialog-title">End this dive?</h2>
              <p>
                This unfinished dive won’t be added to your logbook. Your
                completed dives are already saved.
              </p>
              <div className="leave-actions">
                <button
                  className="primary-button"
                  onClick={() => setModal(null)}
                >
                  KEEP DIVING
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    cancelPendingCheck();
                    setSession(null);
                    setGuess("");
                    setError("");
                    setModal(null);
                  }}
                >
                  END DIVE
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          void importFile(e.target.files?.[0], false);
          e.target.value = "";
        }}
      />
      <input
        ref={bankRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          void importFile(e.target.files?.[0], true);
          e.target.value = "";
        }}
      />
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
