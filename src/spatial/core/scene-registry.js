import lobby from '../scenes/lobby.js';
import samples from '../scenes/samples.js';
import beauty from '../scenes/beauty.js';
import play from '../scenes/play.js';
import party from '../scenes/party.js';
import office from '../scenes/office.js';
import { REGION_JOURNEYS, regionSpec } from '../regional-journeys.js';
import { createSceneRegistry } from './registry.js';
export const FLOORS = [{
  id: 'company',
  number: 1,
  name: ['公司大厅', 'Company & welcome']
}, {
  id: 'products',
  number: 2,
  name: ['产品与样品', 'Products & collections']
}, {
  id: 'global',
  number: 3,
  name: ['战略与全球', 'Strategy & global connections']
}, {
  id: 'data',
  number: 4,
  name: ['数据分析', 'Data studio'],
  enabled: false
}];
// Order here determines directory, tour and model export. No parallel room lists.
export const SCENE_DEFINITIONS = [lobby, samples, beauty, play, party, office, ...Object.keys(REGION_JOURNEYS).sort((a, b) => REGION_JOURNEYS[a].order - REGION_JOURNEYS[b].order).map(id => ({
  ...regionSpec(id),
  id,
  model: 'regional',
  lighting: 'regional',
  region: id,
  navigation: {
    layout: 'promenade',
    corridorX: 7.78
  },
  aliases: id === 'cambodia' ? ['supply'] : [],
  tour: ['overview', ...REGION_JOURNEYS[id].steps.flatMap(s => [s.id, s.id + '-opposite'])]
}))];
export const REGISTRY = createSceneRegistry(SCENE_DEFINITIONS, FLOORS);
export const SCENES = REGISTRY.scenes;
export const TOUR = REGISTRY.tour;
export const TOUR_POINTS = REGISTRY.tourPoints;
export const ALIASES = REGISTRY.aliases;
export const PRODUCT_DOMAINS = REGISTRY.domains;
export const sceneForDomain = domain => Object.values(SCENES).find(s => s.domain === domain);
export const sceneResource = id => SCENES[id] ? `/models/scenes/${SCENES[id].resource}.glb` : null;
export const nextScene = id => TOUR[(TOUR.indexOf(id) + 1) % TOUR.length];
