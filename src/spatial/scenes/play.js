import { productWallPoints } from './product-wall-points.js';
import { view, point } from '../core/scene-definition.js';
export default {
  "id": "play",
  "model": "play",
  "aliases": ["toys"],
  "tour": ["overview", "rings", "maraca", "puzzle", "puzzles", "science", "library"],
  "navigation": {
    "layout": "room",
    "corridorX": 7.78
  },
  "lighting": "day",
  "region": "china",
  "productTitle": ["玩具与探索", "Play & discovery"],
  ...{
    floor: 'products',
    name: ['儿童乐园', 'The play studio'],
    tag: ['好奇 · 触感 · 探索', 'CURIOSITY · TOUCH · DISCOVERY'],
    summary: ['从颜色配对到动手创作，再向窗外探索。', 'Match colours, make new shapes, then explore beyond.'],
    tone: 'light',
    resource: 'play',
    domain: 'play',
    overview: view([0, 2, 8.6], [0, 1.6, -2]),
    points: [point('rings', ['卡牌与桌游', 'Card & board games'], [-2.3, 1.85, -1.4], view([-3.1, 1.7, 1.6], [-3.1, 1.1, -1.4]), {
      type: 'roomProducts',
      id: 'play-colour-magnets', category: 'board-games'
    }), point('maraca', ['创意与拼搭', 'Creative & construction'], [.8, 1.85, -1.8], view([0, 1.7, 1.5], [0, 1, -1.8]), {
      type: 'roomProducts',
      id: 'play-compounds', category: 'creative-kits'
    }), point('puzzle', ['室内外探索', 'Indoor & outdoor play'], [3.9, 2.15, -1.4], view([3.1, 1.8, 1.6], [3.1, 1.5, -1.4]), {
      type: 'roomProducts',
      id: 'play-telescope', category: 'outdoor-play'
    }), ...productWallPoints('play'), point('library', ['产品与档案查询', 'Product library'], [5.65, 1.65, 5.18], view([4.25, 1.8, 7.9], [5.65, 1.45, 5.05]), { type: 'resource', id: 'products', domain: 'play' })]
  }
};
