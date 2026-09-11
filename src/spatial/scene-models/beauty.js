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
  productRoomShell(a, id, 'blush');
  for (const x of [-3, 0, 3]) {
    const bay = group('Vanity atelier', root, [x, 0, -3.9]);
    finish(bay, 0, -1.8, 2.6, 4, 'blush');
    arch(bay, [0, 1.55, -1.68], 1.95, 2.65, 'brass');
    cabinet(bay, 0, -1.23, 2.65, 'blush');
    for (const side of [-1, 1]) {
      cylinder(bay, .04, .85, 'brass', [side * 1.12, 2.7, -1.57]);
      cylinder(bay, .024, .72, 'light', [side * 1.12, 2.7, -1.52]);
    }
    for (let i = 0; i < 4; i++) {
      cylinder(bay, .065, .18 + i * .025, ['rose', 'brass', 'navy', 'ivory'][i], [i * .17 - .27, 1.1, -1.18]);
      cylinder(bay, .046, .055, 'brass', [i * .17 - .27, 1.21 + i * .025, -1.18]);
    }
    const tray = group('Makeup brush and swatch tray', bay, [.65, 1.0, -1.08]);
    box(tray, [.7, .025, .4], 'stone', [0, .02, 0], .012);
    cylinder(tray, .095, .18, 'brass', [-.18, .115, 0]);
    for (let k = 0; k < 4; k++) {
      const brush = group('Brush handle ferrule and bristles', tray, [-.22 + k * .028, .12, 0]);
      brush.rotation.z = (k - 1.5) * .12;
      cylinder(brush, .009, .24, 'navy', [0, .12, 0]);
      cylinder(brush, .014, .055, 'brass', [0, .245, 0]);
      sphere(brush, .028, 'linen', [0, .29, 0], [.7, 1.45, .7]);
    }
    box(tray, [.22, .035, .27], 'navy', [.16, .055, 0], .018);
    for (let k = 0; k < 4; k++) cylinder(tray, .042, .012, ['rose', 'lilac', 'brass', 'sage'][k], [.11 + k % 2 * .09, .08, -.057 + Math.floor(k / 2) * .115]);
    const stool = group('Velvet vanity stool', root, [x, 0, -3.5]);
    cylinder(stool, .39, .47, 'blush', [0, .3, 0]);
    ring(stool, .36, .025, 'brass', [0, .08, 0]);
    cylinder(stool, .4, .12, 'rose', [0, .57, 0]);
  }
  const mirrors = group('Atelier mirror surfaces', root, [0, 2.845, -5.54]);
  mirrors.userData.mirrors = {
    width: 1.8,
    height: 2.55,
    centres: [-3, 0, 3]
  };
  const beautyDisplays = [products.lipDisplay, products.bathDisplay, products.nailDisplay];
  const beautyZones = [['唇部护理', 'LIP CARE'], ['沐浴与护理', 'BATH & CARE'], ['美甲与装饰', 'NAIL ART']];
  beautyDisplays.forEach((display, i) => {
    const x = (i - 1) * 3;
    const plinth = group('Beauty product plinth', root, [x, 0, -1.7]);
    plinth.userData.contactShadow={width:1.82,depth:1.82,ellipse:true};
    cylinder(plinth, .86, .82, 'stone', [0, .41, 0]);
    cylinder(plinth, .88, .04, 'brass', [0, .85, 0]);
    const platter=poweredPlatter(a,plinth,[0,.871,0],{radius:.77,period:28+i*5,holdAt:['lipstick','serum','compact'][i]});
    const hero = display(platter, [0, 0, 0]);
    hero.userData.inspect = ['lipstick', 'serum', 'compact'][i];
    products.label(plinth, ...beautyZones[i], [0, .55, .864], 1.18, .18);
    for (let n = 0; n < 24; n++) {
      const angle = n * Math.PI / 12;
      box(plinth, [.009, .035, .012], 'navy', [Math.cos(angle) * .85, .832, Math.sin(angle) * .85], 0);
    }

  });
  for (const x of [-4.8, 4.8]) {
    plant(root, [x, 0, -4.6]);
    pendant(root, [x, 4.05, -1.5], .45);
  }
  box(root, [8.6, .018, 4.6], 'linen', [0, .012, -1.1]);
  sign(root, ['COLOUR ATELIER', '美妆与护理'], [0, 4.65, -6.76], 5, .48, {
    colour: '#805f58'
  });
  sofa(root, [-6.7, 0, 4.2], Math.PI / 2, 'blush');
  table(root, [-5.25, 0, 4], .62);
  categoryWall(a,id);
  return a;
}
