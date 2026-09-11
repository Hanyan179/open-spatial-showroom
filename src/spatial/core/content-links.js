import { actionErrors, COMPANY_SECTIONS, RESOURCE_SECTIONS, EXPLORER_SECTIONS } from './action-contracts.js';
import { categoryById, categoryForProduct } from './product-categories.js';
export function contentLinkErrors(action, sceneId, registry, products = [], concepts = []) {
  const errors = actionErrors(action);
  if (errors.length) return errors;
  const room = registry.scenes[sceneId];
  const fail = (ok, message) => {
    if (!ok) errors.push(message);
  };
  if (action.type === 'scene') fail(registry.scenes[action.id], `unknown scene ${action.id}`);
  if (action.type === 'roomProducts') {
    const product = products.find(p => p.id === action.id);
    if (action.id) fail(product, `unknown product ${action.id}`);
    if (product) fail(product.domain === room?.domain, `product ${action.id} belongs to another domain`);
    if (action.category && action.category !== 'all') {
      fail(categoryById(action.category)?.domain === room?.domain, `unknown category in this room ${action.category}`);
      if (product) fail(categoryForProduct(product)?.id === action.category, `product ${action.id} does not match category ${action.category}`);
    }
  }
  if (action.type === 'company') fail(COMPANY_SECTIONS.includes(action.id), `unknown company section ${action.id}`);
  if (action.type === 'resource') fail(RESOURCE_SECTIONS.includes(action.id), `unknown resource ${action.id}`);
  if (action.type === 'catalog' && action.section) fail(EXPLORER_SECTIONS.includes(action.section), `unknown explorer section ${action.section}`);
  if (action.type === 'product') fail(concepts.some(p => p.id === action.id), `unknown concept product ${action.id}`);
  if (action.type === 'region') {
    const region = registry.scenes[action.id];
    fail(region?.journey && Number.isInteger(action.chapter) && Boolean(region.points[action.chapter]), `unknown regional chapter ${action.id}/${action.chapter}`);
  }
  if (action.type === 'market') fail(registry.scenes[action.id]?.journey || action.id === 'europe', `unknown region ${action.id}`);
  if (action.at) fail(registry.hasView(sceneId, action.at), `unknown action viewpoint ${action.at}`);
  if (action.side === 'right' && action.type === 'region') {
    const p = registry.scenes[action.id]?.points[action.chapter];
    fail(p && registry.hasView(action.id, p.id + '-opposite'), 'missing opposite-side viewpoint');
  }
  if (action.domain) fail(registry.domains.includes(action.domain), `unknown domain ${action.domain}`);
  if (action.type === 'life') fail(!action.kind || ['photos', 'videos'].includes(action.kind), `unknown media kind ${action.kind}`);
  return errors;
}
export function worldContentErrors(registry, products, concepts) {
  const errors = [];
  for (const room of Object.values(registry.scenes)) {
    for (const point of room.points) {
      errors.push(...contentLinkErrors(point.action, room.id, registry, products, concepts).map(e => `${room.id}/${point.id}: ${e}`));
    }
    for (const entry of room.directoryViews || []) if (entry.action) {
      errors.push(...contentLinkErrors(entry.action, room.id, registry, products, concepts).map(e => `${room.id}/directory: ${e}`));
    }
  }
  for (const product of products) {
    const room = Object.values(registry.scenes).find(s => s.domain === product.domain);
    if (!room || !registry.hasView(room.id, product.point)) errors.push(`${product.id}: missing exhibit viewpoint ${product.point}`);
  }
  return errors;
}
