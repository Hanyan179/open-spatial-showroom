import { view, point } from '../core/scene-definition.js';
export default {
  "id": "office",
  "model": "office",
  "aliases": ["observatory"],
  "tour": ["overview", "desk", "meeting", "earth"],
  "navigation": {
    "layout": "room",
    "corridorX": 8.2
  },
  "lighting": "night",
  "region": "china",
  ...{
    floor: 'global',
    name: ['战略办公室', 'The strategy office'],
    tag: ['立足中国 · 连接世界', 'ROOTED HERE · CONNECTED EVERYWHERE'],
    summary: ['从窗外的地球，走进我们的全球协作。', 'A window onto our global connections.'],
    tone: 'dark',
    resource: 'office',
    overview: view([0, 2.2, 9.8], [0, 3, -6]),
    points: [point('earth', ['探索全球业务', 'Explore global connections'], [0, 3.3, -7.1], view([0, 2.1, 2], [0, 3, -12]), {
      type: 'regions'
    }), point('desk', ['设计到交付', 'From design to delivery'], [-5.2, 1.1, -2.5], view([-2.7, 1.8, 1.2], [-5.2, 1.2, -2.5]), {
      type: 'company',
      id: 'capabilities'
    }), point('meeting', ['品牌与团队', 'Brands & teams'], [5.2, 1.2, 1.5], view([2.5, 1.8, 4.5], [5.2, 1.3, 1]), {
      type: 'company',
      id: 'brands'
    })]
  }
};
