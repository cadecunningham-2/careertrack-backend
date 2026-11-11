/**
 * Explainable fuzzy rule-based inference for SHS strand guidance (engine v2).
 *
 * How it works
 *  1. Inputs are fuzzified: grades and 1–5 interest scores become LOW / MODERATE / HIGH
 *     membership degrees (fuzzy/config.ts).
 *  2. Each strand has the same six kinds of fuzzy rule (fuzzy/rules.ts). Rules combine
 *     memberships with AND (relaxed min) and OR (max), giving a strength from 0 to 1.
 *  3. Rule strengths are aggregated with a weighted average:
 *        S_strand = Σ(weight × strength) / Σ(weight) × 100
 *  4. Strands are ranked. The top three are explained; close scores are reported as
 *     "both plausible" instead of declaring a single winner.
 *
 * This is a weighted rule-scoring system, NOT a full Mamdani system: rule outputs are
 * not mapped to output fuzzy sets and defuzzified. Describe it that way in reports.
 */
import { ALL_RIASEC_QUESTIONS, COURSE_TO_STRAND, FACET_KEYS, RIASEC_DIMENSIONS } from '../data/questions';
import {
  FacetKey, FacetScores, FISInput, FISResult, RIASECAnswers, RIASECKey, RIASECScores, StrandKey,
} from '../types';
import {
  CLOSE_MARGIN, COUNSELOR_NOTES, ENGINE_VERSION, ESTIMATE_GRADE_WEIGHT, EXPLORE_HINTS, FACET_FALLBACK, GAS_MAX_SCORE, LOW_INTEREST_BELOW,
  FIT_BANDS, GRADE_BREAKS, HOLLAND_RANK_CREDIT, HOLLAND_STANDOUT, INTEREST_BREAKS, LOW_CONFIDENCE_BELOW,
  OFFERED_STRANDS, RULE_WEIGHTS, highOf, lowOf,
} from './config';
import { Ctx, Rule, Subject, goalRule, rulesFor } from './rules';

export { ENGINE_VERSION };

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const LETTER: Record<RIASECKey, string> = { realistic: 'R', investigative: 'I', artistic: 'A', social: 'S', enterprising: 'E', conventional: 'C' };

function hollandCode(scores: RIASECScores): string {
  return [...RIASEC_DIMENSIONS].sort((a, b) => scores[b] - scores[a]).slice(0, 3).map((key) => LETTER[key]).join('');
}

function buildContext(input: FISInput): Ctx {
  const { grades, riasecScores, profile } = input;
  const facets = input.facets ?? {};

  const rawGrade = (s: Subject): number | undefined => {
    const v = grades[s];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (s === 'filipinoAp') {
      const e = grades.english;
      return typeof e === 'number' && !Number.isNaN(e) ? e : undefined;
    }
    return undefined;
  };

  // Interests on the 1–5 scale (stored scores are mean × 20).
  const interest = {} as Record<RIASECKey, number>;
  for (const k of RIASEC_DIMENSIONS) interest[k] = clamp((riasecScores[k] ?? 60) / 20, 1, 5);
  const all = RIASEC_DIMENSIONS.map((k) => interest[k]);
  const avg = all.reduce((s, n) => s + n, 0) / all.length;
  const sd = Math.sqrt(all.reduce((s, n) => s + (n - avg) ** 2, 0) / all.length);

  const facet = (k: FacetKey): number => {
    const v = facets[k];
    return typeof v === 'number' && !Number.isNaN(v) ? clamp(v / 20, 1, 5) : interest[FACET_FALLBACK[k]];
  };

  const credit = (k: RIASECKey): number => {
    const rank = all.filter((n) => n > interest[k]).length;
    const standout = clamp((interest[k] - avg) / HOLLAND_STANDOUT, 0, 1);
    return (HOLLAND_RANK_CREDIT[rank] ?? 0) * standout;
  };

  return {
    profile,
    hollandCode: hollandCode(riasecScores),
    has: (s) => rawGrade(s) !== undefined,
    grade: (s) => rawGrade(s) ?? 0,
    gHigh: (s) => highOf(rawGrade(s) ?? 0, GRADE_BREAKS),
    gSolid: (s) => 1 - lowOf(rawGrade(s) ?? 0, GRADE_BREAKS),
    x: (k) => interest[k],
    iHigh: (k) => highOf(interest[k], INTEREST_BREAKS),
    iLow: (k) => lowOf(interest[k], INTEREST_BREAKS),
    f: facet,
    fHigh: (k) => highOf(facet(k), INTEREST_BREAKS),
    hollandCredit: credit,
    sd,
    allInterests: all,
  };
}

interface Scored { rule: Rule; weight: number; strength: number; label: string }

function fitLabel(score: number): string {
  return (FIT_BANDS.find((b) => score >= b.min) ?? FIT_BANDS[FIT_BANDS.length - 1]).label;
}

function lowerFirst(s: string) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

export function runFIS(input: FISInput): FISResult[] {
  const ctx = buildContext(input);
  const profile = input.profile;
  const estimate = profile.gradeSource === 'estimate';

  const strands = [...new Set(OFFERED_STRANDS)];
  const targetStrand: StrandKey | null = COURSE_TO_STRAND[profile.targetCourse] ?? null;
  const goalApplies = !!targetStrand && strands.includes(targetStrand);

  const results: FISResult[] = strands.map((strand) => {
    const rules = [...rulesFor(strand)];
    if (goalApplies) rules.push(goalRule(strand, targetStrand as StrandKey, profile.targetCourse));

    const scored: Scored[] = rules.map((rule) => {
      const missing = (rule.needs ?? []).some((s) => !ctx.has(s));
      let weight = missing ? 0 : RULE_WEIGHTS[rule.kind];
      if (estimate && rule.usesGrades) weight *= ESTIMATE_GRADE_WEIGHT;
      return { rule, weight, strength: clamp(rule.fire(ctx), 0, 1), label: rule.label(ctx) };
    });

    const totalWeight = scored.reduce((s, r) => s + r.weight, 0) || 1;
    let score = Math.round((scored.reduce((s, r) => s + r.weight * r.strength, 0) / totalWeight) * 1000) / 10;
    if (strand === 'GAS') score = Math.min(score, GAS_MAX_SCORE);
    const contribution = (r: Scored) => (r.weight * r.strength) / totalWeight;

    const byImpact = [...scored].filter((r) => r.weight > 0).sort((a, b) => contribution(b) - contribution(a));
    const drivenBy = byImpact.filter((r) => r.strength >= 0.3).slice(0, 4).map((r) => r.label);
    const strengths = byImpact.filter((r) => r.strength >= 0.6).slice(0, 3).map((r) => r.label);

    const hints = EXPLORE_HINTS[strand];
    const explore: string[] = [];
    for (const kind of ['interest', 'academic', 'preference'] as const) {
      const r = scored.find((s) => s.rule.kind === kind);
      if (r && r.weight > 0 && r.strength < 0.35 && explore.length < 2) explore.push(hints[kind]);
    }

    const label = fitLabel(score);
    const summary = strengths.length
      ? `${label}. What supports it: ${strengths.map(lowerFirst).join('; ')}.`
      : `${label}. Few of your answers point to this strand right now, but that does not rule it out.`;

    return { strand, degreeOfMatch: score, drivenBy, strengths, explore, summary, fitLabel: label, engineVersion: ENGINE_VERSION };
  });

  results.sort((a, b) => b.degreeOfMatch - a.degreeOfMatch);
  results.forEach((r, i) => { r.rank = i + 1; });

  const top = results[0];
  const second = results[1];
  const notes: string[] = [];

  if (second && top.degreeOfMatch - second.degreeOfMatch < CLOSE_MARGIN) {
    top.closeCall = true;
    const third = results[2];
    const nearThird = third && top.degreeOfMatch - third.degreeOfMatch < CLOSE_MARGIN;
    const names = nearThird
      ? `${top.strand}, ${second.strand} and ${third.strand} are all`
      : `${top.strand} and ${second.strand} are both`;
    notes.push(`${names} plausible choices for you: their scores are within ${CLOSE_MARGIN} points. Talk with your guidance counselor before deciding.`);
  }
  if (top.degreeOfMatch < LOW_CONFIDENCE_BELOW || Math.max(...ctx.allInterests) < LOW_INTEREST_BELOW) notes.push(COUNSELOR_NOTES.lowConfidence);
  if (targetStrand && targetStrand !== top.strand) {
    const where = results.find((r) => r.strand === targetStrand);
    notes.push(`You named ${profile.targetCourse}, which usually maps to ${targetStrand}${where ? ` (your profile ranks it #${where.rank} at ${where.degreeOfMatch}%)` : ''}. Compare it with your top results.`);
  }
  if (profile.constraint === 'offerings') notes.push(COUNSELOR_NOTES.offerings);
  if (profile.constraint === 'budget') notes.push(COUNSELOR_NOTES.budget);
  if (profile.constraint === 'family') notes.push(COUNSELOR_NOTES.family);
  if (profile.location === 'hometown') notes.push(COUNSELOR_NOTES.hometown);
  if (profile.priority === 'income') notes.push(COUNSELOR_NOTES.income);
  if (profile.priority === 'meaning') notes.push(COUNSELOR_NOTES.meaning);

  top.hollandCode = ctx.hollandCode;
  top.targetStrand = targetStrand;
  if (notes.length) top.counselorNote = notes.join('\n');
  return results;
}

/** Score Holland dimensions from raw Likert answers (1–5), applying reverse items. Returns 0–100. */
export function computeRIASECScores(answers: RIASECAnswers): RIASECScores {
  const scores = {} as RIASECScores;
  for (const dimension of RIASEC_DIMENSIONS) {
    const values = ALL_RIASEC_QUESTIONS.filter((q) => q.dimension === dimension).map((q) => {
      const answer = answers[q.id];
      return answer == null ? null : q.reversed ? 6 - answer : answer;
    }).filter((a): a is number => a != null);
    scores[dimension] = values.length ? Math.round((values.reduce((s, n) => s + n, 0) / values.length) * 200) / 10 : 0;
  }
  return scores;
}

/** Score the finer interest facets (0–100). Facets with no answered question are left out. */
export function computeFacetScores(answers: RIASECAnswers): Partial<FacetScores> {
  const out: Partial<FacetScores> = {};
  for (const facet of FACET_KEYS) {
    const values = ALL_RIASEC_QUESTIONS.filter((q) => q.facets?.includes(facet)).map((q) => {
      const answer = answers[q.id];
      return answer == null ? null : q.reversed ? 6 - answer : answer;
    }).filter((a): a is number => a != null);
    if (values.length) out[facet] = Math.round((values.reduce((s, n) => s + n, 0) / values.length) * 200) / 10;
  }
  return out;
}

