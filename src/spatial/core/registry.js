import { hasBothLanguages } from './i18n.js';
import { viewpoints } from './scene-definition.js';
import { actionErrors } from './action-contracts.js';
const vector = value => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const pose = value => vector(value?.position) && vector(value?.look);
const stableId = value => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);

// Pure function: usable by runtime, asset export, validation and extension fixtures.
export function createSceneRegistry(definitions, floors) {
  const errors = [],
    ids = new Set(),
    aliases = new Set(),
    resources = new Set();
  const floorIds = new Set(floors.map(f => f.id));
  if (floorIds.size !== floors.length) errors.push('duplicate floor id');
  for (const f of floors) if (!hasBothLanguages(f.name)) errors.push(`floor ${f.id}: both languages required`);
  for (const s of definitions) {
    const check = (ok, message) => {
      if (!ok) errors.push(`${s.id}: ${message}`);
    };
    check(stableId(s.id) && !ids.has(s.id), 'invalid or duplicate scene id');
    ids.add(s.id);
    check(floorIds.has(s.floor), 'unknown floor');
    check(stableId(s.model) && stableId(s.resource), 'model and resource identifiers required');
    check(!resources.has(s.resource), 'duplicate resource');
    resources.add(s.resource);
    for (const key of ['name', 'tag', 'summary']) check(hasBothLanguages(s[key]), `${key}: both languages required`);
    check(pose(s.overview), 'invalid overview camera');
    check(['light', 'dark'].includes(s.tone), 'invalid UI tone');
    check(['day', 'night', 'regional'].includes(s.lighting), 'invalid lighting profile');
    check(['room', 'promenade'].includes(s.navigation?.layout), 'navigation layout required');
    check(Number.isFinite(s.navigation?.corridorX), 'safe corridor coordinate required');
    check(stableId(s.region), 'geographic region required');
    const points = Array.isArray(s.points) ? s.points : [];
    check(Array.isArray(s.points), 'hotspot list required');
    const pointIds = new Set(['overview']);
    for (const p of points) {
      check(stableId(p.id) && !pointIds.has(p.id), `invalid or duplicate point ${p.id}`);
      pointIds.add(p.id);
      if (p.tone) check(['light', 'dark'].includes(p.tone), `${p.id}: invalid UI tone`);
      if (p.guideSide) check(['left', 'right'].includes(p.guideSide), `${p.id}: invalid guide side`);
      check(hasBothLanguages(p.name), `${p.id}: both languages required`);
      check(pose(p.camera) && vector(p.anchor), `${p.id}: invalid camera or anchor`);
      for (const error of actionErrors(p.action)) check(false, `${p.id}: ${error}`);
    }
    for (const [key, v] of Object.entries(s.extraViews || {})) {
      check(stableId(key) && !pointIds.has(key), `duplicate viewpoint ${key}`);
      pointIds.add(key);
      check(pose(v), `invalid extra view ${key}`);
    }
    if (s.areas) {
      const assigned = new Set(), areaIds = new Set();
      for (const area of s.areas) {
        check(stableId(area.id) && !areaIds.has(area.id), 'invalid or duplicate area');
        areaIds.add(area.id);
        check(hasBothLanguages(area.name), `area ${area.id}: both languages required`);
        if (area.summary) check(hasBothLanguages(area.summary), `area ${area.id}: bilingual summary required`);
        check(Array.isArray(area.points) && area.points.length > 0, `area ${area.id}: stops required`);
        for (const id of area.points || []) {
          check(points.some(p => p.id === id) && !assigned.has(id), `area ${area.id}: missing or repeated stop ${id}`);
          assigned.add(id);
        }
      }
      check(assigned.size === points.length, 'every hotspot needs a physical area');
    }
    check(Array.isArray(s.tour) && new Set(s.tour).size === s.tour?.length, 'tour must be an ordered unique list');
    for (const stop of s.tour || []) check(pointIds.has(stop), `unknown tour stop ${stop}`);
    for (const alias of s.aliases || []) {
      check(stableId(alias) && !aliases.has(alias), `invalid or duplicate alias ${alias}`);
      aliases.add(alias);
    }
    if (s.domain) check(hasBothLanguages(s.productTitle), 'product title: both languages required');
    for (const entry of s.directoryViews || []) {
      check(pointIds.has(entry.point), `unknown directory viewpoint ${entry.point}`);
      check(hasBothLanguages(entry.name), 'directory viewpoint: both languages required');
    }
  }
  for (const alias of aliases) if (ids.has(alias)) errors.push(`alias collides with scene ${alias}`);
  if (errors.length) throw new Error('Scene registry invalid:\n' + errors.join('\n'));
  const enabled = definitions.filter(s => s.enabled !== false && floors.find(f => f.id === s.floor)?.enabled !== false);
  const scenes = Object.fromEntries(enabled.map(s => [s.id, s]));
  const domains = enabled.filter(s => s.domain).map(s => s.domain);
  if (new Set(domains).size !== domains.length) throw Error('Scene registry invalid: duplicate product domain');
  return {
    scenes,
    floors,
    tour: enabled.filter(s => s.tour.length).map(s => s.id),
    tourPoints: Object.fromEntries(enabled.map(s => [s.id, s.tour])),
    aliases: Object.fromEntries(enabled.flatMap(s => (s.aliases || []).map(alias => [alias, s.id]))),
    domains,
    directory: floors.filter(f => f.enabled !== false).map(f => ({
      ...f,
      rooms: enabled.filter(s => s.floor === f.id && !s.journey),
      regions: enabled.filter(s => s.floor === f.id && s.journey)
    })),
    hasView: (id, at) => Boolean(scenes[id] && viewpoints(scenes[id])[at])
  };
}
