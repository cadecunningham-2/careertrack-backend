/**
 * FUZZY RULES
 * ───────────
 * Every strand is described by the SAME six kinds of rule (see RULE_WEIGHTS in config.ts):
 *   interest · academic · bridge · holland · preference · plan
 * plus an optional "goal" rule when the student named a target course.
 * Strength of each rule is a number from 0 to 1 built with fuzzy AND (min) / OR (max)
 * over membership degrees (LOW / MODERATE / HIGH). No rule ever excludes a strand by itself.
 */
import { FacetKey, RIASECKey, StrandKey, WorkProfile } from '../types';
import {
  AND_RELAXATION, CLASS_EVIDENCE, GAS_GRADE_SD, GAS_UNDECIDED, HOLLAND_FIT, HOLLAND_PRIMARY_SHARE,
  INTEREST_BREAKS, PLAN_EVIDENCE, PROBLEM_EVIDENCE, RuleKind, lowOf,
} from './config';

export type Subject = 'math' | 'science' | 'english' | 'filipinoAp' | 'tle' | 'mapeh';

export interface Ctx {
  profile: WorkProfile;
  hollandCode: string;
  has(s: Subject): boolean;
  grade(s: Subject): number;
  gHigh(s: Subject): number;
  gSolid(s: Subject): number; // "not low": moderate or high
  /** RIASEC interest on the 1–5 scale. */
  x(k: RIASECKey): number;
  iHigh(k: RIASECKey): number;
  iLow(k: RIASECKey): number;
  /** Finer interest facet on the 1–5 scale. */
  f(k: FacetKey): number;
  fHigh(k: FacetKey): number;
  /** How strongly the interest stands out as one of the student's own top interests (0–1). */
  hollandCredit(k: RIASECKey): number;
  /** Spread of the six RIASEC interests (standard deviation, 1–5 scale). */
  sd: number;
  allInterests: number[];
}

export interface Rule {
  id: string;
  kind: RuleKind;
  usesGrades?: boolean;
  /** Rule is skipped (weight 0) when one of these grades was not entered. */
  needs?: Subject[];
  fire: (c: Ctx) => number;
  label: (c: Ctx) => string;
}

// ─── Fuzzy operators ───────────────────────────────────────────────────────
const and = (...v: number[]) => Math.min(...v);
const or = (...v: number[]) => Math.max(...v);
const mean = (v: number[]) => v.reduce((s, n) => s + n, 0) / v.length;
/** AND that does not collapse to 0 when one input is weak (blend of min and average). */
const relaxedAnd = (...v: number[]) => (1 - AND_RELAXATION) * Math.min(...v) + AND_RELAXATION * mean(v);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const R = (n: number) => Math.round(n);

// ─── Per-strand description ─────────────────────────────────────────────────
interface Academic {
  main: Subject[];
  /** all = relaxed AND of the subjects, any = best of them. */
  mode: 'all' | 'any';
  support?: Subject[];
  label: (c: Ctx) => string;
}

interface StrandSpec {
  interestLabel: string;
  core: (c: Ctx) => number;
  gate: (c: Ctx) => number;
  academic: Academic;
}

function academicScore(c: Ctx, a: Academic, f: (s: Subject) => number): number {
  const present = (list: Subject[]) => list.filter((s) => c.has(s));
  const main = present(a.main);
  if (!main.length) return 0;
  const values = main.map(f);
  const m = a.mode === 'all' ? relaxedAnd(...values) : or(...values);
  const sup = present(a.support ?? []);
  return sup.length ? 0.8 * m + 0.2 * mean(sup.map(f)) : m;
}

const SPECS: Record<Exclude<StrandKey, 'GAS'>, StrandSpec> = {
  STEM: {
    interestLabel: 'Interest in science, technology and problem-solving',
    core: (c) => relaxedAnd(or(c.fHigh('science'), c.fHigh('tech')), c.fHigh('mathPS'), c.fHigh('research')),
    gate: (c) => or(c.iHigh('investigative'), c.fHigh('mathPS'), c.fHigh('science'), c.fHigh('tech')),
    academic: { main: ['math', 'science'], mode: 'all', label: (c) => `Math ${R(c.grade('math'))} and Science ${R(c.grade('science'))}` },
  },
  ABM: {
    interestLabel: 'Interest in business, money and entrepreneurship',
    core: (c) => relaxedAnd(c.iHigh('enterprising'), or(c.fHigh('finance'), c.iHigh('conventional')), c.fHigh('entrepreneurship')),
    gate: (c) => or(c.iHigh('enterprising'), c.fHigh('finance'), c.iHigh('conventional'), c.fHigh('entrepreneurship')),
    academic: { main: ['math'], mode: 'all', support: ['english'], label: (c) => `Math ${R(c.grade('math'))}` },
  },
  HUMSS: {
    interestLabel: 'Interest in people, communication and society',
    core: (c) => relaxedAnd(c.iHigh('social'), c.fHigh('communication'), c.fHigh('society')),
    gate: (c) => or(c.iHigh('social'), c.fHigh('communication'), c.fHigh('society')),
    academic: { main: ['english', 'filipinoAp'], mode: 'any', label: (c) => `English ${R(c.grade('english'))} and Filipino/AP ${R(c.grade('filipinoAp'))}` },
  },
  TVL: {
    interestLabel: 'Strong hands-on, practical interests',
    core: (c) => relaxedAnd(c.iHigh('realistic'), c.fHigh('handsOn')),
    gate: (c) => or(c.iHigh('realistic'), c.fHigh('handsOn')),
    academic: { main: ['tle'], mode: 'all', label: (c) => `TLE/ICT ${R(c.grade('tle'))}` },
  },
  ARTS: {
    interestLabel: 'Creative interests in design or performance',
    core: (c) => relaxedAnd(c.iHigh('artistic'), or(c.fHigh('design'), c.fHigh('performing')), c.fHigh('creativity')),
    gate: (c) => or(c.iHigh('artistic'), c.fHigh('design'), c.fHigh('performing')),
    academic: { main: ['mapeh'], mode: 'all', support: ['english'], label: (c) => `MAPEH ${R(c.grade('mapeh'))}` },
  },
  SPORTS: {
    interestLabel: 'Strong interest in sports and physical training',
    core: (c) => c.fHigh('physical'),
    gate: (c) => c.fHigh('physical'),
    academic: { main: ['mapeh'], mode: 'all', support: ['science'], label: (c) => `MAPEH ${R(c.grade('mapeh'))}` },
  },
};

function preferenceOf(strand: StrandKey, p: WorkProfile): number {
  const a = p.problemType ? PROBLEM_EVIDENCE[p.problemType]?.[strand] ?? 0 : 0;
  const b = p.classPick ? CLASS_EVIDENCE[p.classPick]?.[strand] ?? 0 : 0;
  return (a + b) / 2;
}

function hollandFit(strand: Exclude<StrandKey, 'GAS'>, c: Ctx): number {
  const { primary, secondary } = HOLLAND_FIT[strand];
  const p = Math.max(...primary.map((k) => c.hollandCredit(k)));
  const s = Math.max(...secondary.map((k) => c.hollandCredit(k)));
  return HOLLAND_PRIMARY_SHARE * p + (1 - HOLLAND_PRIMARY_SHARE) * s;
}

function standardRules(strand: Exclude<StrandKey, 'GAS'>): Rule[] {
  const spec = SPECS[strand];
  const needs = [...spec.academic.main];
  return [
    { id: `${strand}.interest`, kind: 'interest', fire: spec.core, label: () => spec.interestLabel },
    {
      id: `${strand}.academic`, kind: 'academic', usesGrades: true, needs,
      fire: (c) => academicScore(c, spec.academic, c.gHigh), label: spec.academic.label,
    },
    {
      id: `${strand}.bridge`, kind: 'bridge', usesGrades: true, needs,
      fire: (c) => and(academicScore(c, spec.academic, c.gSolid), spec.gate(c)),
      label: () => 'Your grades and interests point the same way',
    },
    { id: `${strand}.holland`, kind: 'holland', fire: (c) => hollandFit(strand, c), label: (c) => `Your top interest types (${c.hollandCode}) fit this strand` },
    { id: `${strand}.preference`, kind: 'preference', fire: (c) => preferenceOf(strand, c.profile), label: () => 'Your project and class choices lean this way' },
    {
      id: `${strand}.plan`, kind: 'plan',
      fire: (c) => (c.profile.afterGrade12 ? PLAN_EVIDENCE[strand][c.profile.afterGrade12] ?? 0.5 : 0.5),
      label: () => 'Your plans after Grade 12 fit this strand',
    },
  ];
}

// ─── GAS: the flexible option ───────────────────────────────────────────────
const GAS_CORE_SUBJECTS: Subject[] = ['math', 'science', 'english', 'filipinoAp'];

function gasRules(): Rule[] {
  const breadth = (c: Ctx) => mean(c.allInterests.map((x) => 1 - lowOf(x, INTEREST_BREAKS)));
  const evenness = (c: Ctx) => 1 - clamp01(c.sd / 0.9);
  const present = (c: Ctx) => GAS_CORE_SUBJECTS.filter((s) => c.has(s));
  // Grades must be solid AND balanced across subjects (a big gap between subjects points to a specialty).
  const balance = (c: Ctx) => {
    const g = present(c).map((s) => c.grade(s));
    const m = mean(g);
    const sd = Math.sqrt(mean(g.map((n) => (n - m) ** 2)));
    return 1 - clamp01(sd / GAS_GRADE_SD);
  };
  const solid = (c: Ctx) => relaxedAnd(relaxedAnd(...present(c).map(c.gSolid)), balance(c));
  return [
    { id: 'GAS.interest', kind: 'interest', fire: (c) => relaxedAnd(breadth(c), evenness(c)), label: () => 'Broad interests across many areas' },
    { id: 'GAS.academic', kind: 'academic', usesGrades: true, needs: ['math', 'science', 'english'], fire: solid, label: () => 'Solid grades across the core subjects' },
    { id: 'GAS.bridge', kind: 'bridge', usesGrades: true, needs: ['math', 'science', 'english'], fire: (c) => and(solid(c), evenness(c)), label: () => 'Balanced grades and balanced interests' },
    {
      id: 'GAS.holland', kind: 'holland',
      fire: (c) => 1 - Math.max(...(['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'] as RIASECKey[]).map((k) => c.hollandCredit(k))),
      label: () => 'No single interest type dominates',
    },
    { id: 'GAS.preference', kind: 'preference', fire: (c) => (c.profile.afterGrade12 ? GAS_UNDECIDED[c.profile.afterGrade12] ?? 0.3 : 0.3), label: () => 'You want to keep your options open after Grade 12' },
    {
      id: 'GAS.plan', kind: 'plan',
      fire: (c) => {
        const t = c.profile.targetCourse;
        if (!t) return 0.5;
        if (t === 'unsure') return 0.7;
        if (t === 'Other') return 0.6;
        return 0.15;
      },
      label: () => 'You have no specific target course yet',
    },
  ];
}

export function rulesFor(strand: StrandKey): Rule[] {
  return strand === 'GAS' ? gasRules() : standardRules(strand);
}

export function goalRule(strand: StrandKey, targetStrand: StrandKey, course: string): Rule {
  return { id: `${strand}.goal`, kind: 'goal', fire: () => (strand === targetStrand ? 1 : 0), label: () => `You named ${course}` };
}

