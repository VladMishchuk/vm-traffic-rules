import {
  DriverCategoryCode,
  OfficialQuestion,
  RoadSceneConfig,
  RuleMasteryRecord,
} from '@/core/types';
import { matchesCategories } from '@/lib/dataService';
import { CURATED_AI_SCENARIOS } from '../mock/fallbackScenarios';

/**
 * Selects dynamic 2D scene questions tailored to the user's selected categories
 * and weak rule IDs or sections.
 */
export function selectCuratedAiScenarios(
  selectedCategories: DriverCategoryCode[],
  weakRuleIds: string[] = [],
  count = 5
): OfficialQuestion[] {
  const compatible = CURATED_AI_SCENARIOS.filter((q) =>
    matchesCategories(q.categories, selectedCategories)
  );

  // Score scenarios by overlap with weakRuleIds
  const scored = compatible.map((q) => {
    const overlap = q.rule_ids.some((r) => weakRuleIds.includes(r)) ? 2 : 0;
    return { q, score: overlap + Math.random() };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((item) => item.q);
}

/**
 * Resolves or synthesizes a contextual 2D road scene only when the question actually demands a visual road situation
 * (e.g., crossroad priority, roundabout entry, railway crossing stoppage, pedestrian zebra crossing).
 * For purely theoretical, dimensional, verbal, or penalty questions, returns `undefined` so that
 * the user is NOT misled by a completely unrelated roundabout or crossroad diagram.
 */
export function resolveContextualRoadScene(
  item: any,
  _idx: number
): RoadSceneConfig | undefined {
  // 1. If Gemini generated a valid, structured RoadSceneConfig with a supported template and actors
  if (
    item.sceneConfig &&
    typeof item.sceneConfig === 'object' &&
    ['cross_intersection', 't_intersection', 'roundabout', 'rail_crossing', 'pedestrian_crossing', 'straight'].includes(
      item.sceneConfig.template
    ) &&
    Array.isArray(item.sceneConfig.actors) &&
    item.sceneConfig.actors.length > 0
  ) {
    return item.sceneConfig as RoadSceneConfig;
  }

  // 2. Perform intelligent topic and keyword matching
  const qText = String(item.question || '').toLowerCase();
  const title = String(item.section_title || '').toLowerCase();
  const sec = String(item.section || '');
  const rules = Array.isArray(item.rule_ids) ? item.rule_ids.join(' ').toLowerCase() : '';
  const combinedText = `${qText} ${title} ${rules}`;

  const isRailway =
    combinedText.includes('переїзд') ||
    combinedText.includes('колі') ||
    combinedText.includes('поїзд') ||
    sec === '20';

  const isRoundabout =
    combinedText.includes('кругов') ||
    combinedText.includes('кільц') ||
    combinedText.includes('4.10') ||
    combinedText.includes('по колу');

  const isPedestrian =
    combinedText.includes('пішохід') ||
    combinedText.includes('зебр') ||
    combinedText.includes('перехід') ||
    sec === '18';

  const isIntersection =
    combinedText.includes('перехрест') ||
    combinedText.includes('черговість проїзду') ||
    combinedText.includes('порядок проїзду') ||
    combinedText.includes('головна дорога') ||
    combinedText.includes('поступитися дорогою') ||
    combinedText.includes('рівнозначн') ||
    sec === '16' ||
    sec.startsWith('16.');

  // If question is a physical railway crossing situation (stopping, barrier, overtaking at crossing)
  if (isRailway) {
    if (
      qText.includes('зупинити') ||
      qText.includes('проїзд') ||
      qText.includes('обгін') ||
      qText.includes('виїжджати') ||
      qText.includes('шлагбаум') ||
      qText.includes('рейк')
    ) {
      const railTemplate = CURATED_AI_SCENARIOS.find(
        (s) => s.sceneConfig?.template === 'rail_crossing'
      );
      return railTemplate?.sceneConfig;
    }
    // Theoretical rail questions (e.g. sound alarms, hand signals, parking distance) do not have a road layout
    return undefined;
  }

  if (isRoundabout) {
    const roundTemplate = CURATED_AI_SCENARIOS.find(
      (s) => s.sceneConfig?.template === 'roundabout'
    );
    return roundTemplate?.sceneConfig;
  }

  if (isPedestrian) {
    const pedTemplate = CURATED_AI_SCENARIOS.find(
      (s) => s.sceneConfig?.template === 'pedestrian_crossing'
    );
    return pedTemplate?.sceneConfig;
  }

  if (isIntersection) {
    if (combinedText.includes('т-подібн') || combinedText.includes('прилягання')) {
      const tTemplate = CURATED_AI_SCENARIOS.find(
        (s) => s.sceneConfig?.template === 't_intersection'
      );
      if (tTemplate?.sceneConfig) return tTemplate.sceneConfig;
    }
    const crossTemplate = CURATED_AI_SCENARIOS.find(
      (s) => s.sceneConfig?.template === 'cross_intersection'
    );
    return crossTemplate?.sceneConfig;
  }

  // Purely theoretical, legal, dimensional, auditory, or rules questions -> NO scene
  return undefined;
}

/**
 * Enriches an Adaptive Spaced Practice session with dynamic 2D vector road scene questions
 * targeting the user's weakest rules and due-for-review topics.
 */
export function injectDynamic2dScenariosIntoAdaptiveSession(
  baseSessionQuestions: OfficialQuestion[],
  masteryMap: Record<string, RuleMasteryRecord>,
  selectedCategories: DriverCategoryCode[],
  totalCount = 20
): OfficialQuestion[] {
  const weakRules = Object.values(masteryMap)
    .filter((r) => r.masteryScore < 0.75)
    .map((r) => r.itemId);

  const dynamicScenarios = selectCuratedAiScenarios(
    selectedCategories,
    weakRules,
    4
  );

  // Place 2D vector scenarios at the start and interleave them so the user immediately sees them
  const remainingCount = Math.max(0, totalCount - dynamicScenarios.length);
  const officialSlice = baseSessionQuestions
    .filter((q) => !dynamicScenarios.some((d) => d.id === q.id))
    .slice(0, remainingCount);

  const combined: OfficialQuestion[] = [];
  let dIdx = 0;
  let oIdx = 0;

  while (combined.length < totalCount && (dIdx < dynamicScenarios.length || oIdx < officialSlice.length)) {
    // Put a dynamic 2D scene as Q1, Q3, Q6, Q10 for immediate visual engagement
    if (
      dIdx < dynamicScenarios.length &&
      (combined.length === 0 ||
        combined.length === 2 ||
        combined.length === 5 ||
        combined.length === 9 ||
        oIdx >= officialSlice.length)
    ) {
      combined.push(dynamicScenarios[dIdx++]);
    } else if (oIdx < officialSlice.length) {
      combined.push(officialSlice[oIdx++]);
    }
  }

  return combined;
}
