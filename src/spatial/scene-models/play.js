import { discoveryGears } from './working-props.js';
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
  productRoomShell(a, id, 'plaster');
  box(root, [9, .024, 7], 'sage', [0, .019, -1.4], .01);
  ring(root, 3.5, .03, 'ivory', [0, .045, -1.6]);
  const house = group('Playhouse and discovery wall', root, [-4.7, 0, -4.9]);
  for (const x of [-1.5, 1.5]) box(house, [.14, 2.7, .14], 'wood', [x, 1.4, 0]);
  tube(house, [[-1.65, 2.75, 0], [0, 4.05, 0], [1.65, 2.75, 0]], .11, 'wood');
  box(house, [2.9, 2.35, .2], 'teal', [0, 1.2, -.15]);
  arch(house, [0, .2, .01], 1.25, 2.35, 'ivory');
  box(house, [.95, 1.88, .03], 'navy', [0, 1, .02]);
  discoveryGears(a,house,[0,1.4,.045]);
  for (let i = 0; i < 4; i++) {
    const x = 1.7 + i * .72;
    box(root, [.69, .35 + i * .28, 1.4], ['rose', 'yellow', 'teal', 'lilac'][i], [x, (.35 + i * .28) / 2, -4.5], .12);
  }
  tube(root, [[5, 1.8, -4.5], [4.8, 1.5, -3.5], [4, 0.2, -2.8]], .16, 'yellow');
  const playDisplays = [products.sortingDisplay, products.compoundsDisplay, products.telescopeDisplay];
  const playZones = [['颜色认知', 'COLOUR DISCOVERY'], ['动手创作', 'HANDS-ON MAKING'], ['观察探索', 'OBSERVE & EXPLORE']];
  playDisplays.forEach((display, i) => {
    const x = (i - 1) * 3.1;
    const plinth = group('Discovery product station', root, [x, 0, -1.4]);
    cylinder(plinth, .78, .62, ['ivory', 'wood', 'rose'][i], [0, .31, 0]);
    display(plinth, [0, .66, 0]);
    products.label(plinth, ...playZones[i], [0, .34, .784], 1.18, .17);
  });
  // A dedicated making bench adds a credible activity context behind the exhibits.
  const making = worktable(root, [0, 0, -5.1], 3.2, 1.3, 'oak');
  box(making,[1.1,.04,.7],'linen',[-.6,.94,0],.015);
  books(making,[.65,.92,0],4);
  categoryWall(a,id);
  for (let i = 0; i < 7; i++) {
    const o = box(root, [.37, .37, .37], ['rose', 'teal', 'yellow', 'lilac'][i % 4], [-5.9 + i % 2 * .5, .22, -1.8 + Math.floor(i / 2) * .6], .045);
    o.rotation.y = i * .4;
  }
  for (const x of [-3, 0, 3]) {
    pendant(root, [x, 4.2, -1.3], .35);
    if (x !== 0) {
      const hanging=tagAmbient(group('Suspended discovery ball',root,[x,4.11,-1.3]),{kind:'sway',period:x<0?5.7:6.6,amplitude:.065,phase:x<0?0:.36});
      cylinder(hanging, .004, .45, 'brass', [0, -.225, 0]);
      sphere(hanging, .21, x < 0 ? 'rose' : 'teal', [0, -.66, 0]);
    }
  }
  const mobile = group('Kinetic discovery mobile', root, [-4.7, 4.45, -2.8]);
  cylinder(mobile, .005, .8, 'brass', [0, .4, 0]);
  cylinder(mobile, .065, .035, 'brass', [0, .815, 0]);
  const pendulum = tagAmbient(group('Balanced mobile arms', mobile), {
    kind: 'sway',
    period: 13,
    amplitude: .055
  });
  tube(pendulum, [[-.8, 0, 0], [0, .03, 0], [.8, 0, 0]], .012, 'brass');
  for (const [i, x] of [-.7, 0, .7].entries()) {
    cylinder(pendulum, .004, .28 + i * .08, 'brass', [x, -.15 - i * .04, 0]);
    sphere(pendulum, .12, ['rose', 'yellow', 'teal'][i], [x, -.35 - i * .08, 0]);
    ring(pendulum, .2, .02, 'wood', [x, -.35 - i * .08, 0], [0, 0, 0]);
  }
  cabinet(root, 0, -6.35, 4.5, 'oak');
  books(root, [-1.8, 1, -6.15], 10);
  sign(root, ['LITTLE DISCOVERIES', '好奇心，在这里生长'], [0, 4.55, -6.77], 5.5, .52, {
    colour: '#42655b'
  });
  sofa(root, [-7, 0, 4], Math.PI / 2, 'sage');
  return a;
}
