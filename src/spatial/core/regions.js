import { MARKETS } from './markets.js';
import { SCENES } from './scene-registry.js';
// Geographic source records supply labels; scene registration supplies destinations.
export const regions = [...Object.values(SCENES).filter(s => s.journey).map(s => {
  const market = MARKETS.find(m => m.id === s.region);
  const role = s.name.map(n => n.split(' · ').slice(1).join(' · '));
  return [s.id, market.name.zh, market.name.en, ...role];
}), ...MARKETS.filter(m => !Object.values(SCENES).some(s => s.journey && s.region === m.id)).map(m => [m.id, m.name.zh, m.name.en, '区域业务资料', 'Regional business records'])];
