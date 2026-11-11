// @ts-nocheck  (developer script run with `npx tsx`; not part of the app bundle)
/**
 * Validate the recommendation engine.
 *
 *   npx tsx scripts/validate-fis.ts
 *       Runs the synthetic personas (sanity check) and prints their top three.
 *
 *   npx tsx scripts/validate-fis.ts --data assessments.json --labels counselor.csv [--rerun]
 *       Compares the system with counselor judgments.
 *
 *   assessments.json : the array returned by GET /api/assessments (admin token)
 *   counselor.csv    : header  id,counselor_top1,counselor_top2,counselor_top3
 *                      (strand codes: STEM, ABM, HUMSS, GAS, TVL, ARTS, SPORTS; 2 and 3 optional)
 *   --rerun          : re-score saved records with the CURRENT engine instead of using the saved result
 *                      (needs the record to have facets; older records fall back to RIASEC)
 */
import * as fs from 'fs';
import { ALL_RIASEC_QUESTIONS } from '../src/data/questions';
import { PERSONAS, answersFor } from '../src/fuzzy/personas';
import { computeFacetScores, computeRIASECScores, runFIS } from '../src/fuzzy/fis';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

function personas() {
  let failed = 0;
  console.log('\nPERSONA SANITY CHECK\n');
  for (const p of PERSONAS) {
    const answers = answersFor(p);
    const riasecScores = computeRIASECScores(answers);
    const facets = computeFacetScores(answers);
    const profile = { problemType: '', afterGrade12: '', classPick: '', constraint: '', priority: '', location: '', targetCourse: '', gradeSource: '', ...p.profile };
    const res = runFIS({ grades: p.grades, riasecScores, profile, facets });
    const top3 = res.slice(0, 3).map((r) => r.strand);
    const problems = [];
    if (p.expectTop && !p.expectTop.includes(res[0].strand)) problems.push(`expected #1 in [${p.expectTop}] but got ${res[0].strand}`);
    for (const s of p.expectTop3 ?? []) if (!top3.includes(s)) problems.push(`expected ${s} in top 3`);
    if (p.maxScore !== undefined && res[0].degreeOfMatch > p.maxScore) problems.push(`top score ${res[0].degreeOfMatch} exceeds ${p.maxScore}`);
    if (res.some((r) => r.degreeOfMatch < 0 || r.degreeOfMatch > 100)) problems.push('score outside 0-100');
    const ok = problems.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${p.name}`);
    console.log('      ' + res.slice(0, 3).map((r) => `${r.strand} ${r.degreeOfMatch}`).join('  |  ') + (res[0].closeCall ? '   (close call)' : ''));
    for (const pr of problems) console.log('      ! ' + pr);
  }
  console.log(`\n${PERSONAS.length - failed}/${PERSONAS.length} personas behave as expected.\n`);
  return failed;
}

// Small seeded random generator so the check is repeatable.
function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296); }

function invariants() {
  const rand = rng(7);
  const problems = [];
  const mainGrade = { STEM: ['math', 'science'], ABM: ['math'], HUMSS: ['english', 'filipinoAp'], TVL: ['tle'], ARTS: ['mapeh'], SPORTS: ['mapeh'] };
  const emptyProfile = { problemType: '', afterGrade12: 'college', classPick: '', constraint: 'none', priority: 'both', location: 'open', targetCourse: 'unsure', gradeSource: 'reportCard' };
  for (let t = 0; t < 400; t++) {
    const answers = {};
    for (const q of ALL_RIASEC_QUESTIONS) answers[q.id] = 1 + Math.floor(rand() * 5);
    const grades = Object.fromEntries(['math', 'science', 'english', 'filipinoAp', 'tle', 'mapeh'].map((k) => [k, 70 + Math.round(rand() * 28)]));
    const base = { grades, riasecScores: computeRIASECScores(answers), profile: emptyProfile, facets: computeFacetScores(answers) };
    const res = runFIS(base);
    if (res.some((r) => !(r.degreeOfMatch >= 0 && r.degreeOfMatch <= 100))) problems.push(`score out of range (case ${t})`);
    for (const [strand, subjects] of Object.entries(mainGrade)) {
      const before = res.find((r) => r.strand === strand).degreeOfMatch;
      const better = { ...grades };
      for (const s of subjects) better[s] = Math.min(100, grades[s] + 6);
      const after = runFIS({ ...base, grades: better }).find((r) => r.strand === strand).degreeOfMatch;
      if (after < before - 0.05) problems.push(`${strand}: raising ${subjects} lowered the score (${before} -> ${after}, case ${t})`);
    }
  }
  console.log(problems.length ? `INVARIANTS FAILED (${problems.length})\n  ` + problems.slice(0, 8).join('\n  ') : 'INVARIANTS OK: 400 random students, scores in range, better grades never lower the matching strand.');
  return problems.length;
}

function parseCsv(text) {
  const [head, ...rows] = text.trim().split(/\r?\n/);
  const cols = head.split(',').map((s) => s.trim());
  return rows.filter(Boolean).map((r) => Object.fromEntries(r.split(',').map((v, i) => [cols[i], (v ?? '').trim()])));
}

function compare(dataPath, labelsPath, rerun) {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const labels = parseCsv(fs.readFileSync(labelsPath, 'utf8'));
  const byId = new Map(data.map((a) => [a.id, a]));
  let n = 0, top1 = 0, inTop3 = 0, overlap = 0;
  const confusion = {};
  for (const row of labels) {
    const a = byId.get(row.id);
    if (!a) { console.log(`(skipped ${row.id}: not in data file)`); continue; }
    const recs = rerun
      ? runFIS({ grades: a.grades, riasecScores: a.riasec_scores, profile: a.aptitude_ratings, facets: a.aptitude_ratings?.facets })
      : a.recommendations;
    const sys = recs.slice(0, 3).map((r) => r.strand);
    const expert = [row.counselor_top1, row.counselor_top2, row.counselor_top3].filter(Boolean);
    n++;
    if (sys[0] === expert[0]) top1++;
    if (sys.includes(expert[0])) inTop3++;
    overlap += expert.filter((s) => sys.includes(s)).length / expert.length;
    const key = `${expert[0]} -> ${sys[0]}`;
    confusion[key] = (confusion[key] ?? 0) + 1;
  }
  if (!n) { console.log('No matching records.'); return; }
  const pct = (x) => `${((x / n) * 100).toFixed(1)}%`;
  console.log(`\nCOUNSELOR COMPARISON  (n = ${n}, ${rerun ? 'current engine' : 'saved results'})\n`);
  console.log(`System #1 equals counselor #1:        ${top1}/${n}  ${pct(top1)}`);
  console.log(`Counselor #1 is in the system top 3:  ${inTop3}/${n}  ${pct(inTop3)}`);
  console.log(`Average top-3 overlap:                ${((overlap / n) * 100).toFixed(1)}%`);
  console.log('\nCounselor #1 -> System #1 (count)');
  for (const [k, v] of Object.entries(confusion).sort((x, y) => y[1] - x[1])) console.log(`  ${k}: ${v}`);
  console.log('\nRemember: counselors can disagree with each other too. Use this to find patterns, not to prove correctness.\n');
}

const dataPath = opt('--data');
const labelsPath = opt('--labels');
if (dataPath && labelsPath) compare(dataPath, labelsPath, args.includes('--rerun'));
else process.exitCode = (personas() + invariants()) ? 1 : 0;
