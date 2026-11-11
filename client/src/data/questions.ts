import { FacetKey, RIASECKey, StrandKey } from '../types';

/**
 * QUESTION BANK
 * ─────────────
 * Every question has a purpose. Interest questions feed:
 *   • one RIASEC (Holland) dimension, and
 *   • zero or more finer "facets" (science, math problem-solving, research, ...)
 * The fuzzy engine (fuzzy/fis.ts) reads RIASEC scores + facets + grades + the
 * choice questions below. See fuzzy/config.ts for exactly how each is used.
 *
 * Likert answers are 1–5. Items with `reversed: true` are scored as 6 - answer
 * to reduce "agree with everything" bias.
 */

export interface RIASECQuestion {
  id: string;
  dimension: RIASECKey;
  text: string;
  reversed: boolean;
  /** Finer interest facets this question also contributes to. */
  facets?: FacetKey[];
}

export const RIASEC_DIMENSIONS: RIASECKey[] = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];

export const FACET_KEYS: FacetKey[] = [
  'science', 'tech', 'mathPS', 'research', 'handsOn', 'physical', 'finance',
  'entrepreneurship', 'communication', 'society', 'helping', 'design', 'performing', 'creativity',
];

// Kept in a neutral source order; the assessment screen shuffles these before display.
export const ALL_RIASEC_QUESTIONS: RIASECQuestion[] = [
  // Realistic
  { id: 'r1', dimension: 'realistic', reversed: false, facets: ['handsOn'], text: 'Sa mga proyekto, mas gusto kong gumawa o mag-ayos ng aktwal na bagay (gadget, kasangkapan, gulong) kaysa magbasa lang tungkol dito.' },
  { id: 'r2', dimension: 'realistic', reversed: false, facets: ['handsOn'], text: 'Sa TLE o shop class, kusa akong gumagawa ng hands-on na gawain (pagkukumpuni, paggawa, pagtatanim).' },
  { id: 'r3', dimension: 'realistic', reversed: true, facets: ['handsOn'], text: 'Iniiwasan ko ang mga gawaing kailangan ng pisikal na paggawa o paggamit ng mga tools.' },
  { id: 'sp1', dimension: 'realistic', reversed: false, facets: ['physical'], text: 'Mahilig ako sa sports o physical training, at gusto kong humusay pa rito.' },
  { id: 'sp2', dimension: 'realistic', reversed: false, facets: ['physical'], text: 'Mas masigla at mas nakakapag-focus ako kapag aktibo ang katawan ko (laro, ehersisyo, training).' },
  // Investigative
  { id: 'i1', dimension: 'investigative', reversed: false, facets: ['research'], text: 'Nasisiyahan ako sa research o science investigatory projects, lalo na kapag inaalam ko bakit tama ang sagot.' },
  { id: 'i2', dimension: 'investigative', reversed: false, facets: ['mathPS'], text: 'Gustong-gusto kong lutasin ang mga puzzle, math problem, o bagay na kailangan ng masusing pag-iisip.' },
  { id: 'i3', dimension: 'investigative', reversed: true, facets: ['research'], text: 'Nakakasawa sa akin ang mga aktibidad na maraming hakbang ng pagsusuri o eksperimento.' },
  { id: 'sc1', dimension: 'investigative', reversed: false, facets: ['science'], text: 'Mausisa ako kung paano gumagana ang kalikasan, katawan ng tao, o mga kemikal (halimbawa: bakit nagkakasakit ang tao, paano gumagana ang bakuna).' },
  { id: 'sc2', dimension: 'investigative', reversed: false, facets: ['tech'], text: 'Gusto kong matutong mag-code, gumawa ng app o website, o alamin kung paano gumagana ang mga computer at gadget.' },
  // Artistic
  { id: 'a1', dimension: 'artistic', reversed: false, facets: ['design', 'creativity'], text: 'Mas gusto kong gumawa ng sarili kong disenyo, sanaysay, video, o performance kaysa sumunod sa mahigpit na format.' },
  { id: 'a2', dimension: 'artistic', reversed: false, facets: ['creativity'], text: 'Madalas akong mag-isip ng bagong paraan para gawin ang isang bagay, kahit iba ito sa karaniwan.' },
  { id: 'a3', dimension: 'artistic', reversed: true, facets: ['creativity'], text: 'Mas komportable ako kapag malinaw at fixed ang instructions — ayaw ko ng open-ended na gawain.' },
  { id: 'ds1', dimension: 'artistic', reversed: false, facets: ['design'], text: 'Mahilig akong gumuhit, magdisenyo ng poster o layout, o mag-edit ng litrato at video.' },
  { id: 'pf1', dimension: 'artistic', reversed: false, facets: ['performing'], text: 'Gusto kong magtanghal sa entablado o camera, tulad ng pagkanta, pagsayaw, pag-arte, o pagtugtog ng instrumento.' },
  // Social
  { id: 's1', dimension: 'social', reversed: false, facets: ['helping'], text: 'Madalas lumalapit sa akin ang mga kaklase para tumulong sa schoolwork o personal na problema.' },
  { id: 's2', dimension: 'social', reversed: false, facets: ['helping'], text: 'Nasisiyahan akong makinig at tumulong sa iba kahit hindi ko ito kailangang gawin.' },
  { id: 's3', dimension: 'social', reversed: true, facets: ['helping'], text: 'Mas gusto kong mag-isa magtrabaho kaysa makipag-usap o tumulong sa isang grupo.' },
  { id: 'cm2', dimension: 'social', reversed: false, facets: ['society'], text: 'Interesado ako sa mga isyu ng lipunan, batas, kultura, o kasaysayan, at gusto kong pag-usapan o isulat ang mga ito.' },
  // Enterprising
  { id: 'e1', dimension: 'enterprising', reversed: false, facets: ['entrepreneurship'], text: 'Gusto kong mag-organize ng events, mamuno sa grupo, o himukin ang iba na sumunod sa plano ko.' },
  { id: 'e2', dimension: 'enterprising', reversed: false, facets: ['entrepreneurship'], text: 'Interesado akong magbenta, mag-negosyo, o humanap ng paraan para kumita, kahit maliit lang.' },
  { id: 'e3', dimension: 'enterprising', reversed: true, text: 'Iniiwasan ko ang mga responsibilidad na kailangang mag-utos o manguna sa iba.' },
  { id: 'cm1', dimension: 'enterprising', reversed: false, facets: ['communication'], text: 'Komportable akong magpaliwanag ng ideya, makipagdebate, o magsalita sa harap ng klase para makumbinsi ang iba.' },
  // Conventional
  { id: 'c1', dimension: 'conventional', reversed: false, facets: ['finance'], text: 'Komportable ako sa mga gawaing may schedule, records, o kailangan ng eksaktong numero (accounting, inventory, forms).' },
  { id: 'c2', dimension: 'conventional', reversed: false, text: 'Gusto kong maayos at organisado ang aking mga gamit, papeles, o oras.' },
  { id: 'c3', dimension: 'conventional', reversed: true, text: 'Nakakainis sa akin ang mga gawaing paulit-ulit na kailangan ng detalyadong pagsunod sa proseso.' },
  { id: 'fn1', dimension: 'conventional', reversed: false, facets: ['finance'], text: 'Nasisiyahan akong magplano ng budget, mag-ipon, o mag-compute ng kita at gastos.' },
];

export const LIKERT_OPTIONS = [
  { label: 'Halos hindi kailanman', value: 1, emoji: '1' },
  { label: 'Bihira', value: 2, emoji: '2' },
  { label: 'Minsan', value: 3, emoji: '3' },
  { label: 'Madalas', value: 4, emoji: '4' },
  { label: 'Halos palagi', value: 5, emoji: '5' },
] as const;

export interface ChoiceOption { value: string; label: string; emoji: string; }

// Purpose: academic evidence. Each grade feeds the "academic" rules of the strands
// that rely on that subject (see fuzzy/config.ts → ACADEMIC_SUBJECTS).
export const GRADE_QUESTIONS: { field: keyof import('../types').Grades; question: string }[] = [
  { field: 'math', question: 'Mathematics' }, { field: 'science', question: 'Science' },
  { field: 'english', question: 'English' }, { field: 'filipinoAp', question: 'Filipino / Araling Panlipunan (piliin ang mas malapit sa iyo)' },
  { field: 'tle', question: 'TLE / ICT' },
  { field: 'mapeh', question: 'MAPEH (Music, Arts, PE, Health)' },
];
// Purpose: if the grades are only estimates, grade-based rules get less weight.
export const GRADE_SOURCE_QUESTION = {
  question: 'Ang mga grade sa itaas ay:',
  options: [{ value: 'reportCard', label: 'Galing sa report card', emoji: '✓' }, { value: 'estimate', label: 'Tantiya / estimate lang', emoji: '~' }],
} as const;

// Purpose of each choice question (how it is used is defined in fuzzy/config.ts → CHOICE_EVIDENCE / PLAN_EVIDENCE):
//   problemType  → preference evidence for every strand (what kind of work attracts you)
//   classPick    → preference evidence for every strand (what you would choose to study)
//   afterGrade12 → plan alignment (TESDA/work, business, college, undecided)
//   constraint   → counselor notes only (school offerings, budget, family) — never changes scores
export const SCENARIO_QUESTIONS: { field: 'problemType' | 'classPick' | 'afterGrade12' | 'constraint'; question: string; options: ChoiceOption[] }[] = [
  { field: 'problemType', question: 'Kung bibigyan ka ng proyekto, alin ang pinaka-gusto mong gawin?', options: [
    { value: 'puzzles', emoji: '🧩', label: 'Lutasin ang mahirap na math/science problem' }, { value: 'people', emoji: '💬', label: 'Magsulat, mag-organize ng event, o kausapin ang tao tungkol sa isang isyu' },
    { value: 'tools', emoji: '🔧', label: 'Gumawa o mag-ayos ng isang bagay gamit ang kamay/tools' }, { value: 'business', emoji: '📈', label: 'Magplano ng budget o pag-aralan kung paano kikita ang proyekto' },
    { value: 'create', emoji: '🎨', label: 'Gumawa ng disenyo, video, musika, o palabas para sa proyekto' }, { value: 'move', emoji: '🏃', label: 'Mag-organisa o sumali sa isang sports event o physical challenge' },
  ]},
  { field: 'afterGrade12', question: 'Ano ang pinaka-malapit sa plano mo pagkatapos ng Grade 12?', options: [
    { value: 'college', emoji: '🎓', label: 'Mag-college, apat na taong kurso' }, { value: 'tesda', emoji: '🏅', label: 'Mag-TESDA o direktang magtrabaho' },
    { value: 'business', emoji: '🏪', label: 'Magnegosyo o tumulong sa family business' }, { value: 'unsure', emoji: '🤔', label: 'Hindi pa sigurado' },
  ]},
  { field: 'classPick', question: 'Kung pwede kang pumili ng isang extra class ngayon, alin ang pipiliin mo?', options: [
    { value: 'lab', emoji: '🔬', label: 'Research/laboratory class' }, { value: 'debate', emoji: '🎤', label: 'Debate o public speaking class' },
    { value: 'accounting', emoji: '📒', label: 'Accounting/business class' }, { value: 'workshop', emoji: '🛠️', label: 'Workshop/hands-on skills class (welding, cooking, computer repair)' },
    { value: 'arts', emoji: '🎭', label: 'Arts, music, o media production class' }, { value: 'sports', emoji: '🏅', label: 'Sports training o fitness class' },
  ]},
  { field: 'constraint', question: 'Alin sa mga ito ang pinaka-totoong consideration mo ngayon?', options: [
    { value: 'offerings', emoji: '🏫', label: 'Available lang ang ilang strand sa aming paaralan' }, { value: 'budget', emoji: '💸', label: 'Kailangan kong isaalang-alang ang gastos/pinansyal na sitwasyon ng pamilya' },
    { value: 'family', emoji: '👨‍👩‍👧', label: 'May negosyo ang pamilya namin o may kamag-anak na OFW na nagbibigay ng landas' }, { value: 'none', emoji: '✓', label: 'Wala akong malaking hadlang; malaya akong pumili' },
  ]},
];

// Purpose:
//   priority     → counselor note only (what to compare when choosing)
//   location     → counselor note only (check nearby school offerings)
//   targetCourse → one extra rule ("goal alignment") with a small weight; ignored if "unsure"
export const VALUE_QUESTIONS: { field: 'priority' | 'location' | 'targetCourse'; question: string; options: ChoiceOption[] }[] = [
  { field: 'priority', question: 'Mas mahalaga sa akin ang...', options: [{ value: 'income', emoji: '💰', label: 'Magkaroon ng mataas na kita balang araw' }, { value: 'meaning', emoji: '❤️', label: 'Magkaroon ng trabahong may kahulugan o nakakatulong sa iba' }] },
  { field: 'location', question: 'Mas gusto kong...', options: [{ value: 'city', emoji: '🏙️', label: 'Magtrabaho o mag-aral sa lungsod' }, { value: 'hometown', emoji: '🏡', label: 'Manatili malapit sa aming bayan o probinsya' }] },
  { field: 'targetCourse', question: 'Kung may partikular ka nang gustong kurso balang araw, piliin dito (opsyonal):', options: [
    { value: 'unsure', emoji: '🤷', label: 'Hindi pa sigurado' }, { value: 'Nursing', emoji: '🩺', label: 'Nursing' }, { value: 'Accountancy', emoji: '🧾', label: 'Accountancy' },
    { value: 'Education', emoji: '📚', label: 'Education' }, { value: 'Engineering', emoji: '⚙️', label: 'Engineering' }, { value: 'IT-Computer Science', emoji: '💻', label: 'IT-Computer Science' },
    { value: 'Culinary or trade (TVL)', emoji: '🍳', label: 'Culinary or trade (TVL)' }, { value: 'Entrepreneurship-Business', emoji: '🏪', label: 'Entrepreneurship-Business' },
    { value: 'Arts, Design or Media', emoji: '🎨', label: 'Arts, Design or Media' }, { value: 'Sports Science or PE', emoji: '🏋️', label: 'Sports Science o PE' },
    { value: 'Other', emoji: '✦', label: 'Iba pa' },
  ]},
];

/** A named course usually maps to one strand, but it is only one small piece of evidence. */
export const COURSE_TO_STRAND: Record<string, StrandKey> = {
  Nursing: 'STEM', Engineering: 'STEM', 'IT-Computer Science': 'STEM', Accountancy: 'ABM', 'Entrepreneurship-Business': 'ABM', Education: 'HUMSS', 'Culinary or trade (TVL)': 'TVL',
  'Arts, Design or Media': 'ARTS', 'Sports Science or PE': 'SPORTS',
};

export function shuffleQuestions<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
