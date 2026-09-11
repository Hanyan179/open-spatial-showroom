import { view, point } from '../core/scene-definition.js';
export default {
  id: 'samples', model: 'samples', resource: 'samples', floor: 'products',
  name: ['样品导览室', 'Sample orientation'],
  tag: ['从生活场景，发现产品', 'PRODUCTS IN EVERYDAY LIFE'],
  summary: ['先认识三个业务方向，再走进各自的产品房间。', 'Discover three business directions, then enter their product rooms.'],
  tone: 'light', lighting: 'day', region: 'china', navigation: { layout: 'room', corridorX: 7.78 },
  aliases: [], tour: ['overview', 'beauty', 'play', 'party', 'library'],
  overview: view([0, 1.95, 8.6], [0, 1.8, -2.6]),
  points: [
    point('beauty', ['美妆与护理', 'Beauty & care'], [-4.5, 1.6, -2.7], view([-4.5, 1.8, 1.4], [-4.5, 1.65, -2.7]), { type: 'scene', id: 'beauty' }),
    point('play', ['儿童与探索', 'Play & discovery'], [0, 1.6, -2.7], view([0, 1.8, 1.4], [0, 1.65, -2.7]), { type: 'scene', id: 'play' }),
    point('party', ['生日与派对', 'Party & celebration'], [4.5, 1.6, -2.7], view([4.5, 1.8, 1.4], [4.5, 1.65, -2.7]), { type: 'scene', id: 'party' }),
    point('library', ['产品与档案查询', 'Products & archives'], [-6.7, 1.65, 5.3], view([-3, 1.8, 7.6], [-6.7, 1.4, 5.3]), { type: 'catalog', section: 'products' })
  ],
  areas: [
    { id: 'directions', name: ['业务方向陈列', 'Business directions'], points: ['beauty', 'play', 'party'], summary: ['选择一个方向，前往对应产品房间。', 'Choose a direction and visit its product room.'] },
    { id: 'library', name: ['样品与档案查询区', 'Sample & archive desk'], points: ['library'], summary: ['产品、品类与品牌档案，共用一套检索。', 'Browse products, categories and brand records in one library.'] }
  ]
};
