/**
 * FUZZY ENGINE CONFIGURATION
 * ──────────────────────────
 * Everything a guidance counselor might want to review or adjust lives here:
 * the membership functions, rule weights, evidence tables and advice text.
 *
 * IMPORTANT: every number below is an INITIAL, expert-style estimate. None of them
 * has been validated on real students yet. Follow docs/VALIDATION.md, then update
 * these values from what counselors and student results show.
 */
import { AfterGrade12, ClassPick, FacetKey, ProblemType, RIASECKey, StrandKey } from '../types';

/** Bump this when rules, weights or membership functions change, so saved results can be compared. */
export const ENGINE_VERSION = 2;

/**
 * Strands your school actually offers. Remove a strand to stop recommending it.
 * (SHS offerings and names change; confirm with DepEd and your school.)
 */
export const OFFERED_STRANDS: StrandKey[] = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'ARTS', 'SPORTS'];

// ─── Membership functions ───────────────────────────────────────────────────
// Each variable has three overlapping sets: LOW, MODERATE, HIGH. They always add up
// to 1 ("Ruspini partition"), so a value is never "nothing"; it is split across sets.
//   low(x)  = 1 up to `lowFull`, falling to 0 at `lowZero`
//   high(x) = 0 up to `highZero`, rising to 1 at `highFull`
//   moderate(x) = 1 − low(x) − high(x)

export interface Breakpoints { lowFull: number; lowZero: number; highZero: number; highFull: number }

/** Interest scores on a 1–5 scale (average Likert answer). 3 is fully MODERATE; 3.5 is half moderate, half high. */
export const INTEREST_BREAKS: Breakpoints = { lowFull: 2, lowZero: 3, highZero: 3, highFull: 4 };

/**
 * School grades on a 60–100 scale. 75 is the passing mark.
 * ≤75 fully LOW → 81 no longer low; 84 starts to be HIGH → 90 fully HIGH.
 * (DepEd "Outstanding" starts at 90.)
 */
export const GRADE_BREAKS: Breakpoints = { lowFull: 75, lowZero: 81, highZero: 84, highFull: 90 };

const ramp = (x: number, from: number, to: number) => (x <= from ? 0 : x >= to ? 1 : (x - from) / (to - from));
export const lowOf = (x: number, b: Breakpoints) => 1 - ramp(x, b.lowFull, b.lowZero);
export const highOf = (x: number, b: Breakpoints) => ramp(x, b.highZero, b.highFull);
export const moderateOf = (x: number, b: Breakpoints) => Math.max(0, 1 - lowOf(x, b) - highOf(x, b));

// ─── Aggregation ────────────────────────────────────────────────────────────
/**
 * Strand score  S = Σ(weight × rule strength) / Σ(weight) × 100
 * so each rule is a weighted vote and the result is a 0–100 suitability score.
 */
export type RuleKind = 'interest' | 'academic' | 'bridge' | 'holland' | 'preference' | 'plan' | 'goal';

/** Every strand has the same set of rule kinds, so no strand wins just by having more rules. */
export const RULE_WEIGHTS: Record<RuleKind, number> = {
  interest: 3,   // the strand's core interests (e.g. STEM: science/tech + math problem-solving + research)
  academic: 2,   // grades in the subjects the strand relies on
  bridge: 2,     // interest AND ability point the same way
  holland: 1,    // the strand's Holland (RIASEC) types stand out among the student's own interests
  preference: 2, // what the student chooses to do (project + class pick)
  plan: 1,       // plans after Grade 12
  goal: 1,       // a named target course (only counted when the student named one)
};

/** "Relaxed AND": 0 = strict minimum, 1 = plain average. Keeps rules from being all-or-nothing. */
export const AND_RELAXATION = 0.5;

/** If grades are only estimates, grade-based rules count this much of their weight. */
export const ESTIMATE_GRADE_WEIGHT = 0.7;

/** Top two strands closer than this many points are presented as "both plausible". */
export const CLOSE_MARGIN = 6;

/** Below this top score, say plainly that nothing stands out yet. */
export const LOW_CONFIDENCE_BELOW = 45;
/** Also say it when the student rated every interest area below "moderate" (1–5 scale). */
export const LOW_INTEREST_BELOW = 3;

export const FIT_BANDS: { min: number; label: string }[] = [
  { min: 75, label: 'Strong alignment' },
  { min: 60, label: 'Good alignment' },
  { min: 45, label: 'Some alignment' },
  { min: 0, label: 'Limited alignment' },
];

// ─── Which interests count as "the strand's own" (Holland / RIASEC) ─────────
export const HOLLAND_FIT: Record<Exclude<StrandKey, 'GAS'>, { primary: RIASECKey[]; secondary: RIASECKey[] }> = {
  STEM: { primary: ['investigative'], secondary: ['realistic'] },
  ABM: { primary: ['enterprising', 'conventional'], secondary: ['investigative'] },
  HUMSS: { primary: ['social'], secondary: ['artistic', 'enterprising'] },
  TVL: { primary: ['realistic'], secondary: ['conventional', 'investigative'] },
  ARTS: { primary: ['artistic'], secondary: ['social'] },
  SPORTS: { primary: ['realistic'], secondary: ['social', 'enterprising'] },
};

/** Rank → credit. A strand's primary type being the student's #1 interest gives full credit. */
export const HOLLAND_RANK_CREDIT = [1, 0.7, 0.4, 0.15];
/** The interest must also stand out from the student's average by this many points (1–5 scale). */
export const HOLLAND_STANDOUT = 0.6;
export const HOLLAND_PRIMARY_SHARE = 0.7;

// ─── If an interest facet was not answered, approximate it from RIASEC ──────
export const FACET_FALLBACK: Record<FacetKey, RIASECKey> = {
  science: 'investigative', tech: 'investigative', mathPS: 'investigative', research: 'investigative',
  handsOn: 'realistic', physical: 'realistic', finance: 'conventional', entrepreneurship: 'enterprising',
  communication: 'enterprising', society: 'social', helping: 'social',
  design: 'artistic', performing: 'artistic', creativity: 'artistic',
};

// ─── Choice evidence (project + class pick) ─────────────────────────────────
// 1 = strongly points to the strand, small values = weak secondary link.
// A single answer never decides the result: preference is only 2 of ~11 weight points.
type Evidence = Partial<Record<StrandKey, number>>;

export const PROBLEM_EVIDENCE: Record<ProblemType, Evidence> = {
  puzzles: { STEM: 1, ABM: 0.2 },
  people: { HUMSS: 1, ABM: 0.3, ARTS: 0.2 },
  tools: { TVL: 1, STEM: 0.3 },
  business: { ABM: 1, HUMSS: 0.2 },
  create: { ARTS: 1, HUMSS: 0.3 },
  move: { SPORTS: 1 },
};

export const CLASS_EVIDENCE: Record<ClassPick, Evidence> = {
  lab: { STEM: 1 },
  debate: { HUMSS: 1, ABM: 0.2 },
  accounting: { ABM: 1 },
  workshop: { TVL: 1, STEM: 0.2 },
  arts: { ARTS: 1, HUMSS: 0.2 },
  sports: { SPORTS: 1 },
};

/** Plans after Grade 12 → how well each strand fits that plan (0.5 = neutral). */
export const PLAN_EVIDENCE: Record<Exclude<StrandKey, 'GAS'>, Record<AfterGrade12, number>> = {
  STEM: { college: 0.8, tesda: 0.2, business: 0.3, unsure: 0.5 },
  ABM: { college: 0.6, tesda: 0.2, business: 1, unsure: 0.5 },
  HUMSS: { college: 0.8, tesda: 0.1, business: 0.3, unsure: 0.5 },
  TVL: { college: 0.4, tesda: 1, business: 0.6, unsure: 0.4 },
  ARTS: { college: 0.6, tesda: 0.4, business: 0.5, unsure: 0.5 },
  SPORTS: { college: 0.6, tesda: 0.4, business: 0.3, unsure: 0.5 },
};

/** GAS rewards BALANCED grades: grades spread wider than this many points (std. dev.) earn no balance credit. */
export const GAS_GRADE_SD = 8;
/** GAS is never shown as a perfect 100: flexibility is not certainty. */
export const GAS_MAX_SCORE = 90;

/** GAS is the flexible option: it fits students who are undecided about what comes next. */
export const GAS_UNDECIDED: Record<AfterGrade12, number> = { college: 0.35, tesda: 0.05, business: 0.1, unsure: 1 };

// ─── "What to explore" advice, shown when a rule is weak ────────────────────
export const EXPLORE_HINTS: Record<StrandKey, { interest: string; academic: string; preference: string }> = {
  STEM: {
    interest: 'Try a science fair project, a coding short course, or a lab visit to see if research and technical problem-solving appeal to you.',
    academic: 'Ask your Math and Science teachers how to strengthen those subjects; STEM leans on them heavily.',
    preference: 'Compare the activities you picked with what you enjoy doing most. Would you pick a lab or puzzle task if given the chance?',
  },
  ABM: {
    interest: 'Try a small selling project, a budgeting exercise, or shadow someone who runs a business to test your interest.',
    academic: 'Practice basic computation and business-type problems; ABM uses Math regularly.',
    preference: 'Think about whether planning, selling or managing money really attracts you, or whether it was a one-off pick.',
  },
  HUMSS: {
    interest: 'Join a debate, writing, community or student-government activity to see if working with people and ideas suits you.',
    academic: 'Read and write more in English and Filipino; HUMSS involves a lot of reading, writing and discussion.',
    preference: 'Notice whether you seek out discussions, writing or people-centered projects when you have a choice.',
  },
  TVL: {
    interest: 'Visit a school workshop or try a TESDA online course (cooking, ICT, electrical, etc.) to test your hands-on interest.',
    academic: 'Spend more time on TLE/ICT activities; the skills there carry directly into TVL.',
    preference: 'Think about whether making or fixing things is what you actually reach for when you have free time.',
  },
  ARTS: {
    interest: 'Build a small portfolio piece (drawing, video, music, performance) and see how much you enjoy the process.',
    academic: 'Your MAPEH grade is a starting point; arts programs also value a portfolio or audition, so practice outside class.',
    preference: 'Check whether you choose creative work voluntarily, not just when it is assigned.',
  },
  SPORTS: {
    interest: 'Join a school team, training program or fitness club to see if sports and training are more than a hobby for you.',
    academic: 'Keep MAPEH and Science (body and health topics) solid; sports careers also need academic knowledge.',
    preference: 'Think about whether sports or training is where you want to spend your time, not only your free time.',
  },
  GAS: {
    interest: 'Your interests are fairly focused. GAS is for students who want to keep options open, so check it only if you are truly undecided.',
    academic: 'GAS suits students with solid grades across subjects. Strengthen any subject that is currently low.',
    preference: 'If you already know what you want after Grade 12, a more specific strand may fit better.',
  },
};

// ─── Notes for the guidance counselor conversation (never change the scores) ─
export const COUNSELOR_NOTES = {
  offerings: 'Confirm which strands and electives your school actually offers before deciding.',
  budget: 'You mentioned cost is a factor: ask about scholarships, TESDA programs and the real costs of each path.',
  family: 'You mentioned a family business or a relative who can open a path. Talk with your family about how it could fit your options.',
  hometown: 'You prefer to stay near home: check which strands schools in your area offer.',
  income: 'You value higher income: compare typical starting salaries and long-term prospects for careers under your top strands.',
  meaning: 'You value meaningful, helping work: look at the careers in each strand that serve others directly.',
  lowConfidence: 'No strand stands out strongly yet. That is normal if you are still exploring. Talk with your guidance counselor, and consider a broad option such as GAS.',
};
