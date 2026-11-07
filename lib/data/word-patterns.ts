import type { Answer, Prompt, Score } from "../types";

function answers(tiers: Partial<Record<Score, string>>): Answer[] {
  return Object.entries(tiers).flatMap(([score, words]) =>
    words!.split(";").map((name) => ({ name, score: Number(score) as Score })),
  );
}

export const wordPatternPrompts: Prompt[] = [
  {
    id: "words-ending-ness",
    category: "Words",
    prompt: "Name an English word ending in “ness”.",
    note: "Use a single English dictionary word whose complete spelling ends in ness. Standard derived words qualify; proper names do not.",
    answers: answers({
      10: "Happiness;Sadness;Kindness;Darkness;Weakness;Fitness;Illness;Sickness",
      15: "Goodness;Fairness;Sweetness;Madness;Blindness;Deafness;Laziness;Loneliness",
      30: "Awareness;Business;Forgiveness;Greatness;Cleanliness;Readiness;Wilderness;Witness;Carelessness;Fearlessness",
      60: "Restlessness;Selflessness;Mindfulness;Thoughtfulness;Consciousness;Willingness;Stubbornness;Tenderness;Weariness;Drowsiness",
      85: "Fastidiousness;Meticulousness;Perniciousness;Contentiousness;Forthrightness;Scrupulousness;Garrulousness",
      100: "Obstreperousness;Ostentatiousness;Sprightliness",
    }),
  },
  {
    id: "words-ending-ing",
    category: "Words",
    prompt: "Name an English word ending in “ing”.",
    note: "Use a single English dictionary word ending with the letters ing. Nouns, verbs, adjectives, regular participles, and gerunds all qualify when the complete word ends in ing; proper names do not.",
    answers: answers({
      10: "King;Ring;Sing;Thing;Spring;Running;Walking;Swimming;Reading;Writing",
      15: "Cooking;Dancing;Singing;Jumping;Sleeping;Morning;Evening;Building;Ceiling;Clothing",
      30: "Gardening;Painting;Drawing;Shopping;Travelling;Traveling;Interesting;Amazing;Boring;Freezing",
      60: "Sparkling;Dazzling;Wrestling;Sailing;Climbing;Kayaking;Skiing;Hiking;Bookkeeping;Beekeeping",
      85: "Gerrymandering;Orienteering;Bouldering;Canyoning;Snorkelling;Snorkeling;Quarrelling;Quarreling",
      100: "Fossicking;Gleaning;Scumbling;Spelunking",
    }),
  },
  {
    id: "words-ending-tion",
    category: "Words",
    prompt: "Name an English word ending in “tion”.",
    note: "Use a single English dictionary word whose complete spelling ends in tion. Established derived words qualify; proper names do not.",
    answers: answers({
      10: "Action;Station;Question;Education;Information;Nation;Location;Vacation",
      15: "Attention;Direction;Condition;Collection;Production;Protection;Celebration;Tradition",
      30: "Communication;Construction;Transportation;Competition;Population;Pollution;Prediction;Reaction;Creation;Donation",
      60: "Demonstration;Imagination;Exploration;Navigation;Observation;Translation;Evaporation;Condensation;Inspiration;Motivation",
      85: "Transcription;Fermentation;Transplantation;Reconciliation;Desalination;Defenestration;Extrapolation;Circumnavigation",
      100: "Transubstantiation;Discombobulation;Metafiction;Reification",
    }),
  },
];
