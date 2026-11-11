/**
 * PERSONAS: synthetic students used as a SANITY CHECK of the engine.
 *
 * These are NOT validation. They only show that the rules behave sensibly and do not
 * regress when you change weights or membership functions. Real validation needs real
 * students and counselor review (see docs/VALIDATION.md).
 *
 * Counselors: please read the `why` lines and tell us where you disagree.
 */
import { ALL_RIASEC_QUESTIONS } from '../data/questions';
import { Grades, RIASECAnswers, RIASECKey, StrandKey, WorkProfile } from '../types';

export interface Persona {
  name: string;
  why: string;
  grades: Grades;
  /** Likert level (1–5) per RIASEC dimension; others default to `base`. */
  interests: Partial<Record<RIASECKey, number>>;
  /** Raw answer overrides by question id (1–5), applied after `interests`. */
  overrides?: Record<string, number>;
  base?: number;
  profile: Partial<WorkProfile>;
  /** The #1 strand must be one of these. */
  expectTop?: StrandKey[];
  /** All of these must appear in the top three. */
  expectTop3?: StrandKey[];
  /** No strand may exceed this score. */
  maxScore?: number;
}

export function answersFor(p: Persona): RIASECAnswers {
  const out: RIASECAnswers = {};
  for (const q of ALL_RIASEC_QUESTIONS) {
    const level = p.interests[q.dimension] ?? p.base ?? 3;
    out[q.id] = q.reversed ? 6 - level : level;
  }
  for (const [id, v] of Object.entries(p.overrides ?? {})) out[id] = v;
  return out;
}

const g = (math: number, science: number, english: number, filipinoAp: number, tle: number, mapeh: number): Grades =>
  ({ math, science, english, filipinoAp, tle, mapeh });

const prof = (over: Partial<WorkProfile>): Partial<WorkProfile> => ({
  afterGrade12: 'college', constraint: 'none', priority: 'both', location: 'open', targetCourse: 'unsure', gradeSource: 'reportCard', ...over,
});

export const PERSONAS: Persona[] = [
  {
    name: 'Science and math enthusiast',
    why: 'High Math/Science grades, high investigative interest, picks puzzles and lab.',
    grades: g(95, 94, 86, 86, 82, 84),
    interests: { investigative: 5, realistic: 3 },
    profile: prof({ problemType: 'puzzles', classPick: 'lab' }),
    expectTop: ['STEM'],
  },
  {
    name: 'Young entrepreneur',
    why: 'Enterprising + budgeting interests, business project, wants to start a business.',
    grades: g(88, 85, 87, 86, 84, 84),
    interests: { enterprising: 5, conventional: 4 },
    overrides: { fn1: 5, e2: 5 },
    profile: prof({ problemType: 'business', classPick: 'accounting', afterGrade12: 'business' }),
    expectTop: ['ABM'],
  },
  {
    name: 'Communicator and advocate',
    why: 'Social and communication interests, strong English/Filipino, debate.',
    grades: g(82, 82, 94, 93, 82, 85),
    interests: { social: 5, enterprising: 3, investigative: 2 },
    overrides: { cm1: 5, cm2: 5 },
    profile: prof({ problemType: 'people', classPick: 'debate' }),
    expectTop: ['HUMSS'],
  },
  {
    name: 'Hands-on builder',
    why: 'Realistic + hands-on interests, high TLE, wants TESDA or work.',
    grades: g(80, 80, 80, 80, 94, 86),
    interests: { realistic: 5, investigative: 2, social: 2 },
    overrides: { sp1: 3, sp2: 3 },
    profile: prof({ problemType: 'tools', classPick: 'workshop', afterGrade12: 'tesda' }),
    expectTop: ['TVL'],
  },
  {
    name: 'Visual artist and performer',
    why: 'Artistic interests (design + performing), high MAPEH, picks arts.',
    grades: g(80, 80, 88, 88, 82, 94),
    interests: { artistic: 5, conventional: 2 },
    profile: prof({ problemType: 'create', classPick: 'arts' }),
    expectTop: ['ARTS'],
  },
  {
    name: 'Student athlete',
    why: 'High physical-activity interest, top MAPEH, picks sports.',
    grades: g(82, 83, 82, 82, 82, 95),
    interests: { realistic: 4, investigative: 2, artistic: 2 },
    overrides: { sp1: 5, sp2: 5 },
    profile: prof({ problemType: 'move', classPick: 'sports' }),
    expectTop: ['SPORTS'],
  },
  {
    name: 'Undecided all-rounder',
    why: 'Average interests everywhere, balanced grades, unsure about plans. GAS should be at or near the top.',
    grades: g(84, 84, 84, 84, 84, 84),
    interests: {},
    base: 3,
    profile: prof({ problemType: 'people', classPick: 'lab', afterGrade12: 'unsure' }),
    expectTop3: ['GAS'],
  },
  {
    name: 'Interested in everything',
    why: 'Interested in every area with solid grades: no strand should be ruled out and GAS should be in the top three.',
    grades: g(88, 88, 88, 88, 88, 88),
    interests: {},
    base: 4,
    profile: prof({ afterGrade12: 'unsure' }),
    expectTop3: ['GAS'],
  },
  {
    name: 'Business-minded with a weaker Math grade',
    why: 'A single weak grade must not exclude ABM when interests are strong.',
    grades: g(77, 80, 88, 88, 82, 84),
    interests: { enterprising: 5, conventional: 4 },
    overrides: { fn1: 4, e2: 5 },
    profile: prof({ problemType: 'business', classPick: 'accounting', afterGrade12: 'business' }),
    expectTop3: ['ABM'],
  },
  {
    name: 'Equal science and hands-on',
    why: 'Both investigative and realistic are high; STEM and TVL should both appear in the top three (a genuine two-way fit).',
    grades: g(90, 90, 82, 82, 92, 82),
    interests: { investigative: 5, realistic: 5 },
    overrides: { sp1: 3, sp2: 3 },
    profile: prof({ problemType: 'tools', classPick: 'lab' }),
    expectTop3: ['STEM', 'TVL'],
  },
  {
    name: 'Future nurse',
    why: 'High science, caring interests, named Nursing: STEM should lead and HUMSS should still be visible.',
    grades: g(88, 94, 90, 90, 82, 88),
    interests: { investigative: 4, social: 5 },
    profile: prof({ problemType: 'people', classPick: 'lab', targetCourse: 'Nursing' }),
    expectTop: ['STEM'],
    expectTop3: ['HUMSS'],
  },
  {
    name: 'Creative communicator',
    why: 'Artistic and social both high: ARTS and HUMSS should both be in the top three.',
    grades: g(82, 82, 92, 92, 82, 90),
    interests: { artistic: 5, social: 5 },
    overrides: { cm1: 4, cm2: 4 },
    profile: prof({ problemType: 'create', classPick: 'debate' }),
    expectTop3: ['ARTS', 'HUMSS'],
  },
  {
    name: 'Low interest, low grades',
    why: 'Nothing stands out: no strand should look like a confident match.',
    grades: g(76, 76, 76, 76, 76, 76),
    interests: {},
    base: 2,
    profile: prof({ problemType: 'tools', classPick: 'sports', afterGrade12: 'unsure' }),
    maxScore: 62,
  },
  {
    name: 'Strong grades, STEM stereotype, but loves art',
    why: 'High Math/Science grades but the interests and choices point to ARTS: interests should be able to outweigh the stereotype.',
    grades: g(93, 92, 86, 86, 82, 88),
    interests: { artistic: 5, investigative: 2 },
    profile: prof({ problemType: 'create', classPick: 'arts' }),
    expectTop3: ['ARTS'],
  },
];
