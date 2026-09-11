import { poweredPlatter } from './working-props.js';
import { roomKit } from './room-kit.js';
export default function build(id) {
  const a = roomKit(id), { root, group, box, cylinder, sign, target, products, screen, plant, books, pendant } = a;
  a.shell(root);
  const logo = group('Sample centre optional identity', root, [0, 4.2, -6.7]);
  logo.userData.identity = { width: 2.5, dark: true };

  const directions = [
    { id: 'beauty', name: ['美妆与护理', 'BEAUTY & CARE'], colour: 'blush', display: products.lipDisplay },
    { id: 'play', name: ['儿童与探索', 'PLAY & DISCOVERY'], colour: 'sage', display: products.sortingDisplay },
    { id: 'party', name: ['生日与派对', 'PARTY & CELEBRATION'], colour: 'lilac', display: products.favorsDisplay }
  ];
  directions.forEach((d, i) => {
    const x = (i - 1) * 4.5, bay = group('Business direction ' + d.id, root, [x, 0, -3.2]);
    box(bay, [3.65, 2.55, .14], d.colour, [0, 1.85, -.6], .055);
    for (const side of [-1, 1]) box(bay, [.035, 2.55, .055], 'brass', [side * 1.72, 1.85, -.49], .006);
    products.label(bay, ...d.name, [0, 2.85, -.49], 3, .28);
    cylinder(bay, 1.15, .75, 'ivory', [0, .4, .35]);
    cylinder(bay, 1.18, .05, 'brass', [0, .8, .35]);
    const platter=poweredPlatter(a,bay,[0,.827,.35],{radius:1.03,period:36+i*4});
    const exhibit = d.display(platter, [0, 0, 0], 1.25);
    exhibit.traverse(o => { if (o.userData.action) o.userData.action = { type: 'scene', id: d.id }; });
    target(bay, { type: 'scene', id: d.id });
    products.label(bay, '进入产品房间', 'VISIT THE PRODUCT ROOM', [0, .52, 1.52], 1.75, .14);
    if (i !== 1) pendant(root, [x, 4.0, -2.7], .55);
  });
  const desk = group('Shared sample and archive desk', root, [-6.7, 0, 5.3]);
  box(desk, [2.7, .08, 1.05], 'stone', [0, .95, 0], .035);
  box(desk, [2.35, .86, .8], 'navy', [0, .47, 0], .04);
  screen(desk, [0, 1.585, 0], 1.3, .73, [], {kind:'library'});
  target(desk, { type: 'catalog', section: 'products' });
  books(desk, [-1.1, 1, -.1], 4);
  products.label(desk, '产品与档案查询', 'PRODUCTS & ARCHIVES', [0, .64, .412], 1.8, .2);
  plant(root, [-7.7, 0, -5.1], 1.15);
  return a;
}
