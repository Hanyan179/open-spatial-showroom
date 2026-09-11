import { productWallPoints } from './product-wall-points.js';
import { view, point } from '../core/scene-definition.js';
export default {
  "id": "beauty",
  "model": "beauty",
  "aliases": ["gallery"],
  "tour": ["overview", "lipstick", "serum", "compact", "brushes", "sponges", "library"],
  "navigation": {
    "layout": "room",
    "corridorX": 7.78
  },
  "lighting": "day",
  "region": "china",
  "productTitle": ["美妆与护理", "Beauty & care"],
  ...{
    floor: 'products',
    name: ['美妆化妆室', 'The beauty atelier'],
    tag: ['色彩 · 光泽 · 细节', 'COLOUR · LUSTRE · DETAIL'],
    summary: ['唇部护理、沐浴与美甲，展开日常的色彩。', 'Lip care, bath rituals and nail art, in living colour.'],
    tone: 'light',
    resource: 'beauty',
    domain: 'beauty',
    overview: view([0, 1.9, 8.8], [0, 1.65, -2.5]),
    points: [point('lipstick', ['唇部护理', 'Lip care'], [-3, 1.65, -1.3], view([-3, 1.65, 1.5], [-3, 1.5, -1.7]), {
      type: 'roomProducts',
      id: 'beauty-lip-balm', category: 'lip-care'
    }, { inspectable: true }), point('serum', ['沐浴护理', 'Bath care'], [0, 1.7, -1.3], view([0, 1.65, 1.6], [0, 1.6, -1.7]), {
      type: 'roomProducts',
      id: 'beauty-bath-star', category: 'bath'
    }, { inspectable: true }), point('compact', ['美甲装饰', 'Nail art'], [3, 1.7, -1.3], view([3, 1.65, 1.5], [3, 1.35, -1.7]), {
      type: 'roomProducts',
      id: 'beauty-nail-stickers', category: 'nail-art'
    }, { inspectable: true }), ...productWallPoints('beauty'), point('library', ['包装与产品查询', 'Packaging & product library'], [5.65, 1.65, 5.18], view([4.25, 1.8, 7.9], [5.65, 1.45, 5.05]), { type: 'resource', id: 'products', domain: 'beauty' })],
    areas: [
      { id: 'lip-care', name: ['梳妆台 · 唇部护理', 'Vanity · lip care'], points: ['lipstick'], summary: ['走近润唇膏陈列，观察包装与产品资料。', 'Explore lip-care displays, packaging and product references.'] },
      { id: 'bath', name: ['沐浴与护理', 'Bath & care'], points: ['serum'], summary: ['观察星形泡澡球的色彩与陈列细节。', 'Explore the colour and display details of star bath bombs.'] },
      { id: 'nails', name: ['美甲装饰台', 'Nail-art counter'], points: ['compact'], summary: ['走近趣味美甲贴，查看示例产品图。', 'Discover nail-art stickers and the example product illustrations.'] },
      { id: 'tools', name: ['化妆工具墙', 'Makeup tool wall'], points: ['brushes','sponges'], summary: ['探索化妆刷、美妆海绵与粉扑，点击按类筛选。','Explore brushes, sponges and powder puffs by category.'] },
      { id: 'library', name: ['包装与产品查询', 'Packaging & product library'], points: ['library'], summary: ['在查询终端继续查看产品、品类与档案。', 'Continue to products, categories and records at the library terminal.'] }
    ]
  }
};
