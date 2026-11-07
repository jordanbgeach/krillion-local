export type Category =
  | "Geography"
  | "Nature"
  | "Science"
  | "Culture"
  | "Words"
  | "Food";
export type Score = 10 | 15 | 30 | 60 | 85 | 100;
export interface Answer {
  name: string;
  score: Score;
  aliases?: string[];
}
export interface Prompt {
  id: string;
  category: Category;
  prompt: string;
  note: string;
  answers: Answer[];
  source?: string;
}
export interface RoundResult {
  promptId: string;
  input: string;
  answer: string | null;
  score: number;
  timedOut: boolean;
  corrected: boolean;
  ai?: boolean;
}
export interface DiveRecord {
  id: string;
  date: string;
  seed: string;
  mode: "unlimited" | "daily" | "practice";
  results: RoundResult[];
  score: number;
  categories: Category[];
  timer: number;
}
