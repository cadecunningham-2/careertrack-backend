
// ─── Auth & User ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'student' | 'admin';
  created_at?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

// ─── Assessment Inputs ────────────────────────────────────────────────────────
export interface Grades {
  math: number;
  science: number;
  english: number;
  filipinoAp: number;
  tle: number;
  /** Music, Arts, PE & Health. Optional: records saved before v2 do not have it. */
  mapeh?: number;
}

export type RIASECKey =
  | 'realistic'
  | 'investigative'
  | 'artistic'
  | 'social'
  | 'enterprising'
  | 'conventional';

export type RIASECScores = Record<RIASECKey, number>;

/**
 * Finer-grained interest "facets" (0–100, same scale as RIASEC scores).
 * Each facet is the average of the questions that list it (see data/questions.ts).
 */
export type FacetKey =
  | 'science'
  | 'tech'
  | 'mathPS'
  | 'research'
  | 'handsOn'
  | 'physical'
  | 'finance'
  | 'entrepreneurship'
  | 'communication'
  | 'society'
  | 'helping'
  | 'design'
  | 'performing'
  | 'creativity';

export type FacetScores = Record<FacetKey, number>;

export type ProblemType = 'puzzles' | 'people' | 'tools' | 'business' | 'create' | 'move';
export type AfterGrade12 = 'college' | 'tesda' | 'business' | 'unsure';
export type ClassPick = 'lab' | 'debate' | 'accounting' | 'workshop' | 'arts' | 'sports';
export type Constraint = 'none' | 'budget' | 'offerings' | 'family';
export type LifePriority = 'income' | 'meaning' | 'both';
export type LocationPref = 'city' | 'hometown' | 'open';
export type GradeSource = 'reportCard' | 'estimate' | '';

/** Work-style and values answers. Saved in `aptitude_ratings` JSONB. */
export interface WorkProfile {
  problemType: ProblemType | '';
  afterGrade12: AfterGrade12 | '';
  classPick: ClassPick | '';
  constraint: Constraint | '';
  priority: LifePriority | '';
  location: LocationPref | '';
  targetCourse: string;
  gradeSource: GradeSource;
}

/** @deprecated Old self-rated aptitude shape — still present on saved records. */
export interface LegacyAptitudeRatings {
  logical?: number;
  spatial?: number;
  linguistic?: number;
}

/** `facets` is stored next to the profile so a saved record can be re-scored later. */
export type AptitudeRatings = WorkProfile & LegacyAptitudeRatings & { facets?: Partial<FacetScores> };

export interface FISInput {
  grades: Grades;
  riasecScores: RIASECScores;
  profile: WorkProfile;
  /** Optional. When missing, facets are approximated from the RIASEC scores. */
  facets?: Partial<FacetScores>;
}

export type StrandKey = 'STEM' | 'ABM' | 'HUMSS' | 'TVL' | 'GAS' | 'ARTS' | 'SPORTS';

export interface FISResult {
  strand: StrandKey;
  /** Suitability score 0–100. NOT a probability of success, and the scores do not add up to 100. */
  degreeOfMatch: number;
  /** Short reasons shown as chips (most influential first). */
  drivenBy: string[];
  closeCall?: boolean;
  hollandCode?: string;
  counselorNote?: string;
  targetStrand?: StrandKey | null;

  // ── Added in engine v2 (all optional so old saved records still render) ──
  rank?: number;
  fitLabel?: string;
  summary?: string;
  strengths?: string[];
  explore?: string[];
  engineVersion?: number;
}

export interface Assessment {
  id: string;
  user_id: string;
  grades: Grades;
  riasec_scores: RIASECScores;
  aptitude_ratings: AptitudeRatings;
  recommendations: FISResult[];
  created_at: string;
  display_name?: string;
  email?: string;
}

export type RIASECAnswers = Record<string, number>;
