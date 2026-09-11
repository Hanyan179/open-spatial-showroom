import { SCENES, FLOORS, TOUR, TOUR_POINTS, ALIASES as aliases } from './core/scene-registry.js';
import { isRegional } from './regional-journeys.js';
export { SCENES, FLOORS, TOUR, TOUR_POINTS } from './core/scene-registry.js';
export const LIFT = {
  entry: [6.7, 1.72, -5.35],
  inside: [6.7, 1.72, -8.1],
  doorZ: -6.7
};
export const STATE_VERSION = 'scene-world-v3';
export function parseRoute(hash) {
  const [raw, ...rest] = hash.replace(/^#\/?/, '').split('/');
  const id = aliases[raw] || raw;
  const scene = SCENES[id] ? id : 'lobby';
  const point = SCENES[scene].points.find(p => p.id === rest[0])?.id || (SCENES[scene].extraViews?.[rest[0]] ? rest[0] : 'overview');
  return {
    scene,
    point
  };
}
export function sceneView(scene, point = 'overview') {
  const s = SCENES[scene];
  return s.points.find(p => p.id === point)?.camera || s.extraViews?.[point] || s.overview;
}
export function floorOf(scene) {
  return FLOORS.find(f => f.id === SCENES[scene].floor);
}
export function contentTarget(action) {
  return {
    section: action.section || 'products',
    domain: action.domain,
    product: action.type === 'product' ? action.id : undefined,
    sku: action.sku
  };
}
export function validPose(p, scene) {
  return p && Array.isArray(p.position) && p.position.length === 3 && p.position.every(Number.isFinite) && Math.abs(p.position[0]) < 8.6 && p.position[1] > 1 && p.position[1] < 3 && p.position[2] > (isRegional(scene) ? -29 : -6.3) && p.position[2] < 11 && Array.isArray(p.look) && p.look.length === 3 && p.look.every(Number.isFinite);
}
export function restoredView(memory, scene, point) {
  const p = memory[scene + '/' + point],
    safe = sceneView(scene, point);
  return validPose(p, scene) && Math.hypot(...p.position.map((v, i) => v - safe.position[i])) < .6 ? p : safe;
}

// Old content links keep their intent while obsolete building coordinates are discarded.
export function legacyContent(hash) {
  const [raw, kind, id] = hash.replace(/^#\/?/, '').split('/');
  const {
    scene
  } = parseRoute(hash);
  if (kind === 'collection') return {
    type: 'catalog',
    section: 'products'
  };
  if (kind === 'catalog' || kind === 'record') return {
    type: 'catalog',
    section: kind === 'record' ? 'brands' : 'categories'
  };
  if (kind === 'product') return ['lipstick', 'serum', 'compact', 'rings', 'maraca', 'puzzle', 'balloon', 'gift'].includes(id) ? {
    type: 'product',
    id,
    domain: SCENES[scene].domain
  } : {
    type: 'catalog',
    section: 'products',
    domain: SCENES[scene].domain
  };
  if (kind === 'company') return {
    type: 'company',
    id: ['company', 'history', 'culture', 'brands', 'capabilities', 'case'].includes(id) ? id : 'company'
  };
  if (kind === 'honors' || raw === 'honors') return {
    type: 'company',
    id: 'culture'
  };
  if (kind === 'markets') return {
    type: 'regions'
  };
  return null;
}
export function tourDwell(scene, point) {
  const configured=SCENES[scene]?.points.find(p=>p.id===point)?.dwellMs;
  if(Number.isFinite(configured)&&configured>=5000)return configured;
  return point === 'overview' ? 8000 : point === 'lift' ? 5000 : point === 'earth' ? 18000 : point.endsWith('-opposite') ? 8500 : 14000;
}
export function nextTourStop(scene, point = 'overview') {
  const stops = TOUR_POINTS[scene] || ['overview'],
    index = stops.indexOf(point);
  if (index < stops.length - 1) return {
    scene,
    point: stops[Math.max(0, index + 1)]
  };
  return {
    scene: TOUR[(TOUR.indexOf(scene) + 1) % TOUR.length],
    point: 'overview'
  };
}
