import { RoadSceneConfig } from '@/core/types';

/**
 * Resolves a contextual 2D road scene if Gemini generated a valid structured RoadSceneConfig.
 * For purely theoretical, dimensional, verbal, or penalty questions, returns `undefined`.
 */
export function resolveContextualRoadScene(
  item: any,
  _idx: number
): RoadSceneConfig | undefined {
  if (
    item?.sceneConfig &&
    typeof item.sceneConfig === 'object' &&
    [
      'cross_intersection',
      't_intersection',
      'roundabout',
      'rail_crossing',
      'pedestrian_crossing',
      'straight',
    ].includes(item.sceneConfig.template) &&
    Array.isArray(item.sceneConfig.actors) &&
    item.sceneConfig.actors.length > 0
  ) {
    return item.sceneConfig as RoadSceneConfig;
  }

  return undefined;
}
