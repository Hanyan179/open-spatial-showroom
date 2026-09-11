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
  shell(root, {
    colour: 'navy',
    window: false,
    night: true
  });
  // Full-height glazing is in front of a separate exterior Earth scene.
  root.children.filter(o => o.isMesh && Math.abs(o.position.z + 6.94) < .01 && o.position.x < 5).forEach(o => o.removeFromParent());
  for (const x of [-8.85, -5.6, -2.4, .8, 4.1]) box(root, [.08, 5.3, .17], 'brass', [x, 2.65, -6.95]);
  for (const x of [-7.2, -4, -.8, 2.4]) box(root, [3.12, 5.13, .025], 'glass', [x, 2.64, -6.96]);
  box(root, [14.4, .11, .15], 'brass', [-1.8, .12, -6.93]);
  box(root, [14.4, .11, .15], 'brass', [-1.8, 5.17, -6.93]);
  const desk = worktable(root, [-5.2, 0, -2.5], 3.65, 1.6, 'wood');
  box(desk, [2.1, .012, .7], 'navy', [0, .918, 0]);
  target(screen(desk, [-.55, 1.44, -.2], 1.12, .62, [], {kind:'connections'}),{type:'company',id:'capabilities'});
  books(desk, [.7, .92, .1], 5);
  vase(desk, [1.4, .92, -.3], .7);
  chair(root, [-5.2, 0, -4], Math.PI, 'navy');
  chair(root, [-5.5, 0, -.7], 0, 'linen');
  box(root, [5.4, .02, 5.6], 'fabric', [5.05, .018, 1.4]);
  sofa(root, [5.2, 0, -.4], 0, 'linen');
  chair(root, [3.4, 0, 3.2], Math.PI + .15, 'sage');
  chair(root, [6.9, 0, 3.2], Math.PI - .15, 'sage');
  table(root, [5.1, 0, 1.3], .95);
  lamp(root, [7.05, 0, -.65]);
  for (const x of [-7.6, 7.6]) plant(root, [x, 0, 8.5], 1.2);
  sign(root, ['GLOBAL CONNECTIONS'], [-1.2, 4.9, -6.73], 7, .23, {
    colour: '#cbb28b'
  });
  const shelf = group('Leadership library', root, [-8.85, 0, 3.8]);
  shelf.rotation.y = Math.PI / 2;
  for (const y of [.55, 1.5, 2.45, 3.4]) {
    box(shelf, [4.9, .07, .55], 'wood', [0, y, 0]);
    books(shelf, [-2, y + .04, 0], 12);
    vase(shelf, [1.4, y + .04, 0], .8);
  }
  return a;
}
