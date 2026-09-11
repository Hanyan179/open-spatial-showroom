import { productWallPoints } from './product-wall-points.js';
import { view, point } from '../core/scene-definition.js';
export default {
  "id": "party",
  "model": "party",
  "aliases": [],
  "tour": ["overview", "collection", "balloon", "gift", "tableware", "napkins", "library"],
  "navigation": {
    "layout": "room",
    "corridorX": 7.78
  },
  "lighting": "day",
  "region": "china",
  "productTitle": ["生日与派对", "Party & celebration"],
  ...{
    floor: 'products',
    name: ['生日派对', 'A room for celebration'],
    tag: ['相聚 · 礼物 · 仪式感', 'TOGETHER · GIFTS · CELEBRATION'],
    summary: ['把色彩和心意，留在值得记住的时刻。', 'Make room for the moments that matter.'],
    tone: 'light',
    resource: 'party',
    domain: 'party',
    overview: view([0, 2.1, 9.6], [0, 1.7, -2]),
    points: [point('balloon', ['气球布置', 'Balloons'], [-3.4, 2.1, -2], view([-2.7, 1.8, 2], [-3.4, 2, -2]), {
      type: 'roomProducts',
      id: 'party-number-balloon', category: 'balloons'
    }), point('gift', ['派对装饰与小物', 'Decor & favours'], [2.8, 1.35, -1.7], view([2.8, 1.75, 2], [2.8, 1.1, -1.7]), {
      type: 'roomProducts',
      id: 'party-blowouts', category: 'favours'
    }), point('collection', ['生日蜡烛', 'Birthday candles'], [0, 2.65, -2.8], view([0, 1.8, 1.4], [0, 1.2, -2.5]), {
      type: 'roomProducts',
      id: 'party-smile-candles', category: 'candles'
    }), ...productWallPoints('party'), point('library', ['产品与档案查询', 'Product library'], [5.65, 1.65, 5.18], view([4.25, 1.8, 7.9], [5.65, 1.45, 5.05]), { type: 'resource', id: 'products', domain: 'party' })]
  }
};
