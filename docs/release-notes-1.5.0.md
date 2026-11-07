# Krillion 1.5.0

Live at [jordangeach.com/krillion](https://jordangeach.com/krillion/), with updated source and a portable local download.

- **A richer ocean:** multiple parallax layers, moving waves, caustic light, and sea life pass the diver. The submarine pitches during thrust and settles at the new depth.
- **Discoveries get their own response:** accepted answers emit soft sonar rings and bubbles. Rare 85- and 100-point answers add gem constellations; completing a dive creates a brief underwater sparkle bloom. Skipped answers add no celebration or depth.
- **Rolling numbers and small transitions:** HUD, points, results, and logbook counters animate locally. Prompts, pages, buttons, dialogs, toasts, and the AI checking indicator have coordinated motion. Screen readers receive stable final counter values.
- **Motion preferences work throughout:** both the operating system and manual reduced-motion setting snap depth and counters to their targets and suppress decorative movement. The next prompt starts with its full timer and keyboard focus.
- **Bounded effects and lighter rendering:** particles are capped, celebrations finish once, and memoized ocean groups and answer banks avoid repeated large renders. Counter frames update only their digit spans.

This is a presentation update. Scoring, the 108-prompt bank, the 30,000-form dictionary, and AI judging retain their existing behavior.

Development-browser verification covered a perfect seven-round dive to 7,000m, a 10-point `Koala` reveal with seven particles and no constellation, a skipped answer without effects, reduced motion snapping to 4,000m, a fresh 25-second next prompt with input focus, and a 390px phone layout without horizontal overflow or focus jumps. Logbook numbers retained their 27px display size. See the [animation validation record](animation-validation-1.5.0.json).

All 43 Node tests, type checking, and both production builds passed. Live assets and dictionary data match the production build. The published game was checked through a moving 100-point reveal with eight constellation stars and 20 particles, landing at 2,000m, and full-bank search.
