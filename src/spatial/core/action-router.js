import { actionErrors } from './action-contracts.js';
import { SCENES } from './scene-registry.js';
const panel = value => ({
  kind: 'panel',
  panel: value
});
// UI components and Three objects send the same plain-data action.
export const ACTION_HANDLERS = Object.freeze({
  scene: action => ({ kind: 'navigate', scene: action.id }),
  market: action => action.id === 'europe' ? {
    ...panel({
      type: 'europe'
    }),
    market: 'europe'
  } : {
    kind: 'navigate',
    scene: action.id,
    market: action.id
  },
  directory: () => ({
    kind: 'directory'
  }),
  roomProducts: (action, scene) => panel({
    type: 'roomProducts',
    domain: SCENES[scene]?.domain,
    id: action.id,
    ...(action.category ? { category: action.category } : {})
  }),
  life: action => panel({
    type: 'life',
    kind: action.kind || 'photos',
    index: action.index
  }),
  resource: action => panel({
    type: 'resource',
    id: action.id,
    domain: action.domain,
    ...(action.partner ? {partner:action.partner} : {})
  }),
  company: action => panel({
    type: 'company',
    id: action.id,
    ...(action.year ? {year:action.year} : {})
  }),
  region: action => panel({
    type: 'region',
    id: action.id,
    chapter: action.chapter
  }),
  regions: () => panel({
    type: 'regions'
  }),
  product: action => ({
    kind: 'explorer',
    target: {
      section: action.section || 'products',
      domain: action.domain,
      product: action.id,
      sku: action.sku
    }
  }),
  catalog: action => ({
    kind: 'explorer',
    target: {
      section: action.section || 'products',
      domain: action.domain,
      sku: action.sku
    }
  })
});
export function resolveAction(action, scene) {
  const errors = actionErrors(action);
  if (errors.length) throw Error(errors.join('; '));
  return ACTION_HANDLERS[action.type](action, scene);
}

// Content is queued until arrival, including regional exhibits whose guide is optional.
export function hotspotDestination(action, scene, currentPoint) {
  if (action.type === 'life') {
    const at = action.at || 'culture';
    return currentPoint === at ? null : {
      scene,
      point: at,
      action
    };
  }
  const room = SCENES[scene];
  const match = room.points.find(p => p.action.type === action.type && (action.category ? p.action.category === action.category : (p.action.id || '') === (action.id || '')) && (action.chapter === undefined || p.action.chapter === action.chapter));
  if (!match) return null;
  return {
    scene,
    point: action.side === 'right' ? match.id + '-opposite' : match.id,
    action
  };
}
