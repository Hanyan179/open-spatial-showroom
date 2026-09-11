import { poweredPlatter } from './working-props.js';
import { categoryWall } from './category-wall.js';
import * as T from 'three';
import { tagAmbient } from '../ambient.js';
import { roomKit, productRoomShell } from './room-kit.js';
export default function build(id) {
  const a = roomKit(id);
  const {
    root,
    group,
    mesh,
    box,
    cylinder,
    sphere,
    tube,
    ring,
    sign,
    target,
    books,
    vase,
    plant,
    chair,
    sofa,
    table,
    lamp,
    frame,
    arch,
    shell,
    products,
    sample,
    finish,
    pendant,
    cabinet,
    worktable,
    screen
  } = a;
  productRoomShell(a, id, 'lilac');
  const fest = group('Birthday celebration table', root, [0, 0, -2.8]);
  cylinder(fest, 2.2, .1, 'ivory', [0, .97, 0]);
  cylinder(fest, 1.45, .88, 'rose', [0, .45, 0]);
  ring(fest, 2.1, .02, 'brass', [0, .93, 0]);
  for (let i = 0; i < 32; i++) {
    const angle = i * Math.PI / 16;
    cylinder(fest, .015, .8, 'blush', [Math.cos(angle) * 1.47, .47, Math.sin(angle) * 1.47]);
  }
  const cake=poweredPlatter(a,fest,[0,1.025,0],{radius:.69,period:42,fullTurn:true});
  cylinder(cake, .63, .3, 'blush', [0,.15,0]);
  cylinder(cake, .48, .28, 'ivory', [0,.44,0]);
  products.candles(cake, [0,.58,0]);
  target(fest, {
    type: 'roomProducts',
    id: 'party-smile-candles'
  });
  products.reference(fest, 'party-smile-candles', [0, 1.35, 1.78]);
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3,
      x = Math.cos(angle) * 1.7,
      z = Math.sin(angle) * 1.7;
    target(cylinder(fest, .27, .018, 'white', [x, 1.035, z]), { type: 'roomProducts', id: 'party-cone-cups', category: 'tableware' });
    ring(fest, .24, .012, 'brass', [x, 1.05, z]);
    cylinder(fest, .065, .22, 'glass', [x + .27, 1.16, z - .12]);
    const place = group('Linen napkin and cutlery', fest, [x, 1.057, z]);
    place.rotation.y = -angle;
    target(box(place, [.21, .02, .27], 'blush', [0, .01, 0], .008), { type: 'roomProducts', id: 'party-napkins', category: 'napkins' });
    ring(place, .035, .009, 'brass', [0, .035, 0], [0, 0, 0]);
    for (const q of [-.33, .33]) {
      box(place, [.016, .014, .32], 'brass', [q, 0, 0], .006);
      sphere(place, .03, 'brass', [q, .005, -.16], [.7, .25, 1.3]);
    }
  }
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    const b = products.blowout(fest, [Math.cos(angle) * 1.55, 1.08, Math.sin(angle) * 1.55], ['#ea8aa5', '#80bdb1', '#e5bf62'][i % 3], angle, 1.3);
    target(b, {
      type: 'roomProducts',
      id: 'party-blowouts'
    });
  }
  // Keep a clear title band above the moving arch. Close-to-wall placement
  // also preserves that clearance from the low cake and side viewpoints.
  const balloonArch = [
    [-3.8, 1.75], [-3.15, 2.55], [-2.25, 3], [-1.15, 3.35],
    [0, 3.45],
    [1.15, 3.35], [2.25, 3], [3.15, 2.55], [3.8, 1.75]
  ];
  for (const [i, [x, y]] of balloonArch.entries()) {
    const tether = tagAmbient(group('Tethered celebration balloon', root, [x * .9, .4, -6.08]), {
      kind: 'sway',
      period: 9 + i * .27,
      phase: i * .21,
      amplitude: .021
    });
    sphere(tether, .41, ['rose', 'lilac', 'ivory', 'brass'][i % 4], [x * .1, y - .4, -.08], [1, 1.15, 1]);
    tube(tether, [[x * .1, y - .82, -.08], [0, 0, 0]], .009, 'ivory');
    cylinder(tether, .025, .03, 'rose', [x * .1, y - .89, -.08], .004);
  }
  cylinder(root, .72, .65, 'stone', [2.8, .33, -1.7]);
  products.favorsDisplay(root, [2.8, .67, -1.7], 1.05);
  products.label(root, '派对小物', 'PARTY FAVOURS', [2.8, .4, -.967], 1.15, .16);
  products.foilDisplay(root, [-3.4, .15, -2]);
  sign(root, ['MAKE ROOM FOR JOY', '生日与庆祝'], [0, 4.65, -6.77], 5, .55, {
    colour: '#604e77'
  });
  categoryWall(a,id);
  for (const x of [-4.8, 4.8]) {
    chair(root, [x, 0, x > 0 ? -4.4 : 2.2], x < 0 ? .65 : -.65, 'blush');
    pendant(root, [x, 3.8, 1], .52);
  }
  cabinet(root, -6.8, -5.3, 2.8, 'lilac');
  vase(root, [-6.8, 1, -5.3], 1.2);
  return a;
}
