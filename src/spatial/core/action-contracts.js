// One vocabulary shared by model hotspots, scene definitions and the host dispatcher.
export const ACTIONS = Object.freeze({
  scene: { required: ['id'] },
  market: {
    required: ['id']
  },
  directory: {
    required: []
  },
  roomProducts: {
    required: []
  },
  life: {
    required: []
  },
  resource: {
    required: ['id']
  },
  company: {
    required: ['id']
  },
  region: {
    required: ['id', 'chapter']
  },
  regions: {
    required: []
  },
  product: {
    required: ['id']
  },
  catalog: {
    required: []
  }
});
export const PANEL_TYPES = ['explorer', 'roomProducts', 'life', 'resource', 'company', 'region', 'regions', 'europe'];
export const COMPANY_SECTIONS = ['company', 'history', 'culture', 'brands', 'capabilities', 'case'];
export const RESOURCE_SECTIONS = ['news', 'partners', 'products'];
export const EXPLORER_SECTIONS = ['products', 'categories', 'brands'];
export function actionErrors(action) {
  const contract = ACTIONS[action?.type];
  if (!contract) return [`unknown action type: ${action?.type}`];
  if (action.type === 'roomProducts' && !action.id && !action.category) return ['roomProducts requires id or category'];
  return contract.required.filter(key => action[key] === undefined || action[key] === null || action[key] === '').map(key => `${action.type} requires ${key}`);
}
