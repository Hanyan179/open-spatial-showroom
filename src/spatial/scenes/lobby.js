import { view, point } from '../core/scene-definition.js';
export default {
  directoryViews: [{
    point: 'overview',
    name: ['入口全景', 'Arrival']
  }, {
    point: 'reception',
    name: ['前台近景', 'Reception']
  }, {
    point: 'lounge',
    name: ['新闻阅读区', 'News lounge'],
    action: {
      type: 'resource',
      id: 'news'
    }
  }, {
    point: 'culture',
    name: ['电视与照片墙', 'TV & photo wall'],
    action: {
      type: 'life',
      kind: 'videos',
      at: 'culture'
    }
  }, {
    point: 'lift',
    name: ['电梯厅', 'Lift lobby']
  }, {
    point: 'entrance',
    name: ['反向看入口', 'Entrance view']
  }],
  "id": "lobby",
  "model": "lobby",
  "aliases": ["welcome", "upper", "honors"],
  "tour": ["overview", "reception", "story", "partners", "lounge", "culture", "lift"],
  "navigation": {
    "layout": "room",
    "corridorX": 7.2
  },
  "lighting": "day",
  "region": "china",
  ...{
    floor: 'company',
    name: ['欢迎大厅', 'Welcome hall'],
    tag: ['从这里，关于展厅', 'A WORLD OF POSSIBILITIES'],
    summary: ['创意、品牌与人，在这里相遇。', 'A place where ideas, brands and people meet.'],
    tone: 'light',
    resource: 'lobby',
    overview: view([0, 2.0, 10.3], [0, 2.0, -3.5]),
    points: [point('reception', ['关于展厅', 'Meet SHOWROOM'], [0, 1.4, -2.5], view([0, 1.75, 2.7], [0, 2.15, -3.7]), {
      type: 'company',
      id: 'company'
    }), point('lounge', ['新闻阅读区', 'Company news'], [-4.1, 1.85, 2.1], view([-2.8, 1.8, 5.4], [-6.2, 1.4, 1.6]), {
      type: 'resource',
      id: 'news'
    }), point('culture', ['电视与照片墙', 'TV & photo wall'], [8.4, 2.3, .4], view([3.25, 1.85, 1.65], [8.85, 2.08, .4]), {
      type: 'life',
      kind: 'videos',
      at: 'culture'
    }), point('story', ['公司发展历程', 'Our company story'], [7.96, 1.6, 8.55], view([2.7, 1.8, 7.8], [8.3, 1.8, 8.1]), {
      type: 'company', id: 'history'
    }), point('partners', ['合作伙伴', 'Our partners'], [8.05, 1.95, 5.4], view([4.0, 1.8, 5.8], [8.3, 1.75, 5.6]), {
      type: 'resource', id: 'partners'
    }, { guideSide: 'right' })],
    areas: [
      { id: 'welcome', name: ['公司接待', 'Company welcome'], points: ['reception'] },
      { id: 'story', name: ['公司文化廊', 'Company story gallery'], points: ['story', 'partners'], summary: ['浏览历程示例与合作展示的位置。', 'Explore sample milestones and partner displays.'] },
      { id: 'lounge', name: ['窗边会客区', 'Reception lounge'], points: ['lounge', 'culture'], summary: ['阅读新闻、观看公司影像与照片。', 'Read news and explore company films and photographs.'] }
    ],
    extraViews: {
      lift: view([5.5, 1.8, -.3], [6.7, 2, -6.6]),
      entrance: view([3.8, 1.8, -1.4], [-1, 2.2, 10.8])
    }
  }
};
