import {
  DriverCategoryCode,
  OfficialQuestion,
  RulesDatabase,
} from '@/core/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_BUCKET = 'vm-traffic-rules.firebasestorage.app';
const DOWNLOAD_TOKEN = 'pdr_catalog_asset_v1';
const BUNDLE_STORAGE_URL = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/bundles%2Fcatalog_v1.json?alt=media&token=${DOWNLOAD_TOKEN}`;

let cachedQuestions: OfficialQuestion[] | null = null;
let cachedRules: RulesDatabase | null = null;
let bundlePromise: Promise<{
  questions: OfficialQuestion[];
  rules: RulesDatabase;
}> | null = null;

/**
 * Converts any local or relative image path into a Firebase Storage WebP URL.
 * Example:
 * - "/images/1_1.png" -> "https://firebasestorage.googleapis.com/v0/b/.../o/questions%2F1_1.webp?alt=media&token=..."
 * - "/images/knowledge_base/signs/1_1.png" -> "https://firebasestorage.googleapis.com/v0/b/.../o/knowledge%2Fsigns%2F1_1.webp?alt=media&token=..."
 */
export function toStorageImageUrl(p: string | null | undefined): string | null {
  if (!p) return null;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;

  let clean = p.replace(/^\//, '');
  clean = clean.replace(/\.png$/i, '.webp').replace(/\.jpg$/i, '.webp');

  if (clean.startsWith('images/knowledge_base/')) {
    clean = clean.replace('images/knowledge_base/', 'knowledge/');
  } else if (clean.startsWith('images/')) {
    clean = clean.replace('images/', 'questions/');
  }

  const encoded = encodeURIComponent(clean);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encoded}?alt=media&token=${DOWNLOAD_TOKEN}`;
}

interface RawCatalogBundle {
  version: number;
  collections: {
    categories: any[];
    examSections: any[];
    questions: any[];
    ruleSections: any[];
    rules: any[];
    glossaryTerms: any[];
    signCategories: any[];
    signs: any[];
    markings: any[];
    trafficLights: any[];
    idSigns: any[];
    badges: any[];
  };
}

function processCatalogBundle(data: RawCatalogBundle): {
  questions: OfficialQuestion[];
  rules: RulesDatabase;
} {
  const col = data.collections || ({} as any);

  // 1. Process Questions
  const questions: OfficialQuestion[] = (col.questions || []).map((q: any) => ({
    id: q.id,
    section: q.sectionId,
    section_title: q.sectionTitle,
    number: String(q.number || ''),
    image_path: toStorageImageUrl(q.imagePath),
    question: q.question,
    options: q.options || [],
    answer_index: q.answerIndex,
    categories: (q.categories || []) as DriverCategoryCode[],
    rule_ids: q.ruleIds && q.ruleIds.length > 0 ? q.ruleIds : q.refIds || [],
    explanation: q.explanation || '',
    sceneConfig: q.sceneConfig || undefined,
  }));

  // 2. Process Rules Database
  const ruleSectionsMap = new Map();
  for (const r of col.rules || []) {
    const secId = r.ruleSectionId;
    if (!ruleSectionsMap.has(secId)) {
      ruleSectionsMap.set(secId, []);
    }
    ruleSectionsMap.get(secId).push({
      id: r.id,
      number: r.number,
      text: r.text,
      sub_items: r.subItems || [],
      law_url: r.lawUrl,
      categories: r.categories || [],
    });
  }

  const sections = (col.ruleSections || []).map((s: any) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    law_url: s.lawUrl,
    categories: s.categories || [],
    items: (ruleSectionsMap.get(s.id) || []).sort(
      (a: any, b: any) => parseFloat(a.number) - parseFloat(b.number)
    ),
  })).sort((a: any, b: any) => a.number - b.number);

  const signs = (col.signs || []).map((s: any) => ({
    id: s.id,
    number: s.number,
    name: s.name,
    category_id: s.categoryId,
    category_name: s.categoryName,
    description: s.description,
    image_path: toStorageImageUrl(s.imagePath),
    law_url: s.lawUrl,
  })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const markings = (col.markings || []).map((m: any) => ({
    id: m.id,
    number: m.number,
    name: m.name,
    type: m.type,
    category_name: m.categoryName,
    color: m.color || 'білий',
    description: m.description,
    image_path: toStorageImageUrl(m.imagePath),
    law_url: m.lawUrl,
  }));

  const traffic_lights = (col.trafficLights || []).map((tl: any) => ({
    id: tl.id,
    name: tl.name,
    type: tl.type,
    description: tl.description,
    image_path: toStorageImageUrl(tl.imagePath),
    rule_ref: tl.ruleId || '8.7',
    law_url: tl.lawUrl,
  }));

  const id_signs = (col.idSigns || []).map((ids: any) => ({
    id: ids.id,
    letter: ids.letter || '',
    name: ids.name,
    description: ids.description,
    image_path: toStorageImageUrl(ids.imagePath),
    rule_ref: ids.ruleId || '30.3',
    law_url: ids.lawUrl,
  }));

  const glossary = (col.glossaryTerms || []).map((g: any) => ({
    id: g.id,
    term: g.term,
    definition: g.definition,
    rule_ref: g.ruleId || '1.10',
    law_url: g.lawUrl,
  }));

  const driver_categories = (col.categories || []).map((c: any) => ({
    code: c.code as DriverCategoryCode,
    group: c.group,
    name: c.name,
    min_age: c.minAge,
    description: c.description,
    exam_sections: c.examSectionIds || [],
  }));

  const rules: RulesDatabase = {
    metadata: {
      title: 'Правила дорожнього руху України',
      law_name: 'Постанова Кабінету Міністрів України № 1306',
      law_url: 'https://zakon.rada.gov.ua/laws/show/1306-2001-%D0%BF',
      parsed_at: new Date().toISOString(),
    },
    driver_categories,
    sections,
    glossary,
    signs,
    markings,
    traffic_lights,
    id_signs,
  };

  return { questions, rules };
}

async function loadFromFirestoreFallback(): Promise<{
  questions: OfficialQuestion[];
  rules: RulesDatabase;
}> {
  if (!db) throw new Error('Firestore not initialized');
  console.log('[dataService] Falling back to direct Firestore collections query...');
  const [qSnap, rSnap, secSnap, sSnap, mSnap, tlSnap, idSnap, gSnap, cSnap] =
    await Promise.all([
      getDocs(collection(db, 'questions')),
      getDocs(collection(db, 'rules')),
      getDocs(collection(db, 'rule_sections')),
      getDocs(collection(db, 'signs')),
      getDocs(collection(db, 'markings')),
      getDocs(collection(db, 'traffic_lights')),
      getDocs(collection(db, 'id_signs')),
      getDocs(collection(db, 'glossary_terms')),
      getDocs(collection(db, 'categories')),
    ]);

  const rawBundle: RawCatalogBundle = {
    version: 1,
    collections: {
      categories: cSnap.docs.map((d) => d.data()),
      examSections: [],
      questions: qSnap.docs.map((d) => d.data()),
      ruleSections: secSnap.docs.map((d) => d.data()),
      rules: rSnap.docs.map((d) => d.data()),
      glossaryTerms: gSnap.docs.map((d) => d.data()),
      signCategories: [],
      signs: sSnap.docs.map((d) => d.data()),
      markings: mSnap.docs.map((d) => d.data()),
      trafficLights: tlSnap.docs.map((d) => d.data()),
      idSigns: idSnap.docs.map((d) => d.data()),
      badges: [],
    },
  };

  const processed = processCatalogBundle(rawBundle);
  cachedQuestions = processed.questions;
  cachedRules = processed.rules;
  return processed;
}

async function fetchCatalogBundle(): Promise<{
  questions: OfficialQuestion[];
  rules: RulesDatabase;
}> {
  if (cachedQuestions && cachedRules) {
    return { questions: cachedQuestions, rules: cachedRules };
  }

  // 1. Fetch from Firebase Storage (bundles/catalog_v1.json)
  try {
    const res = await fetch(BUNDLE_STORAGE_URL);
    if (res.ok) {
      const rawBundle = (await res.json()) as RawCatalogBundle;
      const processed = processCatalogBundle(rawBundle);
      cachedQuestions = processed.questions;
      cachedRules = processed.rules;
      return processed;
    }
    console.warn(`[dataService] Storage bundle responded with status ${res.status}`);
  } catch (err) {
    console.warn('[dataService] Storage bundle fetch error, attempting Firestore fallback:', err);
  }

  // 2. Fallback: Query Firestore collections directly
  return await loadFromFirestoreFallback();
}

export async function loadQuestions(): Promise<OfficialQuestion[]> {
  if (cachedQuestions) return cachedQuestions;
  if (!bundlePromise) {
    bundlePromise = fetchCatalogBundle();
  }
  const { questions } = await bundlePromise;
  return questions;
}

export async function loadRules(): Promise<RulesDatabase> {
  if (cachedRules) return cachedRules;
  if (!bundlePromise) {
    bundlePromise = fetchCatalogBundle();
  }
  const { rules } = await bundlePromise;
  return rules;
}

/**
 * Checks if a question matches at least one of the user's selected categories (`A1`..`T`).
 */
export function matchesCategories(
  itemCategories: DriverCategoryCode[],
  selectedCategories: DriverCategoryCode[]
): boolean {
  if (!selectedCategories || selectedCategories.length === 0) return true;
  return itemCategories.some((c) => selectedCategories.includes(c));
}

export interface ExamSectionSummary {
  section: string;
  title: string;
  categories: DriverCategoryCode[];
  questionCount: number;
}

/**
 * Returns the list of thematic sections (out of 65) available for the user's selected categories.
 */
export function getAvailableSectionsForCategories(
  questions: OfficialQuestion[],
  selectedCategories: DriverCategoryCode[]
): ExamSectionSummary[] {
  const map = new Map<string, ExamSectionSummary>();
  for (const q of questions) {
    if (!matchesCategories(q.categories, selectedCategories)) continue;
    const key = String(q.section);
    const existing = map.get(key);
    if (existing) {
      existing.questionCount += 1;
    } else {
      map.set(key, {
        section: key,
        title: q.section_title,
        categories: q.categories,
        questionCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => parseFloat(a.section) - parseFloat(b.section)
  );
}

function sampleRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

/**
 * Official ГСЦ МВС Ukraine 20-question exam ticket generator for a chosen category:
 * - 10 questions: Core ПДР України (sections 1..34)
 * - 4 questions: Vehicle construction, terms & legal liability for the category (sec 36 + category sections)
 * - 4 questions: Traffic safety (sec 35, 38, 39 + category safety section)
 * - 2 questions: First aid (sec 37)
 */
export function generateOfficialExamTicket(
  questions: OfficialQuestion[],
  targetCategory: DriverCategoryCode
): OfficialQuestion[] {
  const catQuestions = questions.filter((q) =>
    q.categories.includes(targetCategory)
  );

  const pdrPool = catQuestions.filter((q) => parseFloat(String(q.section)) <= 34);
  const medicalPool = catQuestions.filter((q) => String(q.section) === '37');
  const safetySections = new Set(['35', '38', '39', '43', '47', '51', '55', '59', '63']);
  const safetyPool = catQuestions.filter((q) => safetySections.has(String(q.section)));
  const vehicleLawSections = new Set([
    '36',
    '40', '41', '42',
    '44', '45', '46',
    '48', '49', '50',
    '52', '53', '54',
    '56', '57', '58',
    '60', '61', '62',
  ]);
  const vehicleLawPool = catQuestions.filter((q) =>
    vehicleLawSections.has(String(q.section))
  );

  const ticket = [
    ...sampleRandom(pdrPool, 10),
    ...sampleRandom(vehicleLawPool, 4),
    ...sampleRandom(safetyPool, 4),
    ...sampleRandom(medicalPool, 2),
  ];

  if (ticket.length < 20 && catQuestions.length > ticket.length) {
    const existingIds = new Set(ticket.map((q) => q.id));
    const remaining = catQuestions.filter((q) => !existingIds.has(q.id));
    ticket.push(...sampleRandom(remaining, 20 - ticket.length));
  }

  return ticket;
}

/**
 * Converts a technical rule ID (e.g. "rule_1_10", "term_zasliplennya", "sign_2_1", "marking_1_1", "16.12")
 * into a concise, human-readable Ukrainian label using the structure of `rules.json`.
 */
export function formatRuleIdLabel(
  rId: string,
  rules?: RulesDatabase | null
): string {
  const db = rules ?? cachedRules;
  if (!rId) return 'ПДР';

  if (db) {
    // 1. Glossary terms (e.g., term_zasliplennya -> Термін «засліплення»)
    if (rId.startsWith('term_')) {
      const term = db.glossary.find((g) => g.id === rId);
      if (term) return `Термін «${term.term}»`;
    }

    // 2. Road signs (e.g., sign_2_1 -> Знак 2.1 «Дати дорогу»)
    if (rId.startsWith('sign_')) {
      const cleanNum = rId.replace(/^sign_/, '').replace(/_/g, '.');
      const sign = db.signs.find(
        (s) => s.id === rId || s.number === cleanNum
      );
      if (sign) {
        const shortName =
          sign.name.length > 24 ? `${sign.name.slice(0, 22)}…` : sign.name;
        return `Знак ${sign.number} «${shortName}»`;
      }
      return `Знак ${cleanNum}`;
    }

    // 3. Road markings (e.g., marking_1_1 -> Розмітка 1.1)
    if (rId.startsWith('marking_')) {
      const cleanNum = rId.replace(/^marking_/, '').replace(/_/g, '.');
      const marking = db.markings.find(
        (m) => m.id === rId || m.number === cleanNum
      );
      if (marking) return `Розмітка ${marking.number}`;
      return `Розмітка ${cleanNum}`;
    }

    // 4. Rule items (e.g., rule_1_10 or "16.12" -> Пункт 1.10 ПДР)
    const cleanRuleNum = rId.replace(/^rule_/, '').replace(/_/g, '.');
    for (const sec of db.sections) {
      for (const it of sec.items) {
        if (it.id === rId || it.number === rId || it.number === cleanRuleNum) {
          return `Пункт ${it.number} ПДР`;
        }
      }
    }
  }

  // Graceful Ukrainian fallbacks even before rules finishes loading
  if (rId.startsWith('rule_')) {
    return `Пункт ${rId.replace(/^rule_/, '').replace(/_/g, '.')} ПДР`;
  }
  if (rId.startsWith('sign_')) {
    return `Знак ${rId.replace(/^sign_/, '').replace(/_/g, '.')}`;
  }
  if (rId.startsWith('marking_')) {
    return `Розмітка ${rId.replace(/^marking_/, '').replace(/_/g, '.')}`;
  }
  if (rId.startsWith('term_')) {
    return 'Термін ПДР (п. 1.10)';
  }
  if (rId.startsWith('sec_')) {
    return `Тема ${rId.replace(/^sec_/, '')}`;
  }
  if (/^\d+(\.\d+)+$/.test(rId)) {
    return `Пункт ${rId} ПДР`;
  }

  return rId;
}
