import * as T from 'three';
import { tagAmbient } from '../ambient.js';
import { roomKit, productRoomShell } from './room-kit.js';
import { companyGallery } from './company-gallery.js';
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
  shell(root);
  // The identity screen stays below a real high-level daylight strip.
  root.children.filter(o => o.isMesh && Math.abs(o.position.z + 6.94) < .01 && o.position.x < 5).forEach(o => {
    root.remove(o);
    o.geometry.dispose();
  });
  box(root, [14.35, 3.95, .28], 'plaster', [-1.825, 1.975, -6.94]);
  for (const x of [-8.95, -5.6, -2.3, 1, 4.9]) box(root, [.07, 1.25, .16], 'navy', [x, 4.6, -6.94]);
  for (const x of [-7.28, -3.95, -.65, 2.94]) box(root, [x === 2.94 ? 3.82 : 3.23, 1.14, .025], 'glass', [x, 4.59, -6.94]);
  for (const y of [4.0, 5.22]) box(root, [14.35, .07, .18], 'navy', [-1.825, y, -6.94]);
  for (const x of [-6.4, .4]) plant(root, [x, 0, -9], 1.8);
  const reception = group('Folded reception desk', root, [0, 0, -3.3]);
  box(root, [6.8, 3.85, .25], 'plaster', [0, 1.95, -5.75], .035);
  for (const x of [-3.52, 3.52]) box(root, [.075, 3.72, .21], 'brass', [x, 1.97, -5.72]);
  box(root, [7.12, .045, .05], 'light', [0, 3.98, -5.52]);
  const logo = group('Configurable welcome sign', root, [0, 2.65, -5.59]);
  logo.userData.identity = {
    dark: true,
    width: 3.85,
    height: 1.9
  };
  box(reception, [5.55, 1.06, 1.22], 'ivory', [0, .63, 0], .055);
  box(reception, [5.72, .11, 1.36], 'stone', [0, 1.22, 0], .035);
  box(reception, [5.24, .12, 1.06], 'navy', [0, .08, 0], .025);
  const fold = new T.Shape();
  fold.moveTo(-2.6, 1.08);
  fold.lineTo(-.6, 1.08);
  fold.lineTo(2.72, .35);
  fold.lineTo(2.72, .1);
  fold.lineTo(.3, .1);
  fold.closePath();
  mesh(reception, new T.ExtrudeGeometry(fold, {
    depth: .04,
    bevelEnabled: true,
    bevelSize: .012,
    bevelThickness: .012,
    bevelSegments: 2
  }), 'navy', [0, 0, .61]);
  for (let x = -2.4; x < 2.6; x += .85) box(reception, [.008, .92, .008], 'stone', [x, .64, .626], .002);
  target(screen(reception, [-1.95, 1.73, -.15], .84, .46, [], {kind:'welcome'}),{type:'company',id:'company'});
  books(reception, [1.3, 1.29, .03], 3);
  vase(reception, [2.1, 1.28, -.15], .63);
  const pen = group('Reception stationery', reception, [-.45, 1.29, .2]);
  cylinder(pen, .07, .12, 'brass', [0, .06, 0]);
  for (let i = 0; i < 3; i++) {
    const p = cylinder(pen, .007, .19, 'navy', [i * .016 - .016, .16, 0]);
    p.rotation.z = (i - 1) * .12;
  }

  // Comfortable, asymmetrical hospitality composition with a clear central aisle.
  const rug = box(root, [5.2, .018, 5.1], 'fabric', [-5.65, .018, 2.45], .008);
  rug.rotation.y = .07;
  sofa(root, [-6.3, 0, .65], .14);
  chair(root, [-7.5, 0, 4.25], Math.PI - .3, 'sage');
  chair(root, [-4.45, 0, 3.9], Math.PI + .4);
  const loungeTable = table(root, [-5.8, 0, 2.35], .78);
  loungeTable.children.filter(o => o.name === 'Bound books').forEach(o => o.removeFromParent());
  loungeTable.children.find(o => o.name === 'Ceramic vessel').position.set(.46, .58, -.22);
  const journal = group('Folded Showroom journal', loungeTable, [-.19, .59, .09]);
  journal.rotation.x = -Math.PI / 2;
  journal.rotation.z = -.15;
  box(journal, [.62, .82, .025], 'ivory', [0, 0, 0], .009);
  for (let k = 0; k < 5; k++) box(journal, [.61, .8, .001], 'stone', [0, 0, -.012 + k * .002], 0);
  sign(journal, ['SHOWROOM JOURNAL'], [0, .27, .018], .55, .1);
  box(journal, [.53, .009, .003], 'navy', [0, .19, .018], 0);
  sign(journal, ['NEWS & STORIES'], [0, .09, .018], .5, .1);
  sign(journal, ['COMING SOON'], [0, -.2, .018], .47, .065, {
    colour: '#80725e'
  });
  target(journal, {
    type: 'resource',
    id: 'news'
  });
  lamp(root, [-7.8, 0, .7]);
  plant(root, [-7.7, 0, -3.7], 1.3);
  // Replaceable company-life media sits inside real frames, never over the room.
  const newsRack = group('Company news reading stand', root, [-4.4, 0, 1.65]);
  newsRack.rotation.y = .34;
  box(newsRack, [.72, .055, .55], 'navy', [0, .04, 0], .022);
  box(newsRack, [.09, 1.05, .11], 'brass', [0, .55, -.09], .015);
  const newsBoard = group('Upright newspaper and leaflet shelf', newsRack, [0, 1.3, 0]);
  newsBoard.rotation.x = -.12;
  box(newsBoard, [.78, 1.06, .07], 'navy', [0, 0, 0], .022);
  box(newsBoard, [.7, .97, .012], 'ivory', [0, 0, .046], .006);
  sign(newsBoard, ['展厅来信'], [0, .32, .058], .62, .12, {
    i18n: {
      zh: ['展厅来信'],
      en: ['SHOWROOM JOURNAL']
    }
  });
  box(newsBoard, [.61, .006, .003], 'brass', [0, .21, .059], 0);
  sign(newsBoard, ['NEWS & STORIES'], [0, .09, .058], .57, .14);
  sign(newsBoard, ['COMING SOON'], [0, -.22, .058], .58, .06, {
    colour: '#897554'
  });
  box(newsBoard, [.77, .04, .18], 'brass', [0, -.53, .08], .01);
  target(newsRack, {
    type: 'resource',
    id: 'news'
  });
  const wall = group('Company culture gallery', root, [8.85, 0, .4]);
  wall.rotation.y = -Math.PI / 2;
  box(wall, [5.8, 3.25, .06], 'wood', [0, 2.05, 0]);
  for (let x = -2.7; x < 2.8; x += .14) box(wall, [.045, 3.2, .07], 'oak', [x, 2.05, .055], .01);
  sign(wall, ['公司日常'], [0, 3.35, .15], 2.5, .22, {
    colour: '#f4ebdb',
    i18n: {
      zh: ['公司日常'],
      en: ['LIFE & STORIES']
    }
  });
  const television = group('Wall mounted company television', wall, [0, 2.28, .19]);
  box(television, [.9, .5, .07], 'brass', [0, 0, -.08]);
  box(television, [2.49, 1.43, .085], 'navy', [0, 0, 0], .035);
  box(television, [2.4, 1.35, .012], 'black', [0, 0, .049], .016);
  for (let i = 0; i < 22; i++) box(television, [.036, .004, .016], 'stone', [-.58 + i * .055, -.706, .004], .001);
  sphere(television, .008, 'light', [1.1, -.69, .048]);
  const tvSurface = group('Company video screen', television, [0, 0, .059]);
  tvSurface.userData.mediaSurface = {
    kind: 'video',
    slot: 0,
    w: 2.36,
    h: 1.3275
  };
  sign(tvSurface, ['公司影像'], [0, 0, 0], 2.3, .6, {
    colour: '#e9dbc0',
    i18n: {
      zh: ['公司影像', '真实故事，等待上映'],
      en: ['COMPANY FILMS', 'Real stories, coming soon']
    }
  });
  target(television, {
    type: 'life',
    kind: 'videos',
    at: 'culture'
  });
  const soundbar = group('Television soundbar', wall, [0, 1.42, .23]);
  box(soundbar, [1.28, .09, .11], 'navy', [0, 0, 0], .035);
  for (let i = 0; i < 45; i++) box(soundbar, [.009, .041, .004], 'stone', [-.55 + i * .025, 0, .057], .001);
  for (let i = 0; i < 4; i++) {
    const photo = group('Company photograph frame ' + (i + 1), wall, [i < 2 ? -2.05 : 2.05, i % 2 ? 1.74 : 2.84, .17]);
    box(photo, [1.24, .86, .06], 'ivory', [0, 0, 0], .018);
    frame(photo, [0, 0, .04], 1.24, .86, 'brass');
    const mount = group('Replaceable photograph ' + (i + 1), photo, [0, 0, .077]);
    mount.userData.mediaSurface = {
      kind: 'photo',
      slot: i,
      w: 1.08,
      h: .7
    };
    const labels = [['团队瞬间', 'OUR PEOPLE'], ['工作日常', 'AT WORK'], ['相聚时刻', 'TOGETHER'], ['新的发现', 'DISCOVERIES']][i];
    sign(mount, labels, [0, 0, 0], .94, .25, {
      colour: '#8b806c'
    });
    target(photo, {
      type: 'life',
      kind: 'photos',
      index: i,
      at: 'culture'
    });
  }
  const console = group('Gallery console', wall, [0, 0, .25]);
  cabinet(console, 0, .15, 5.7);
  books(console, [-2.2, 1.0, .1], 5);
  const remote = box(console, [.1, .018, .28], 'navy', [.55, 1.012, .2], .012);
  target(remote, {
    type: 'life',
    kind: 'videos',
    at: 'culture'
  });
  target(wall, {
    type: 'company',
    id: 'culture'
  });
  plant(root, [4.5, 0, -4.9], 1.18);
  finish(root, -5.75, -6.76, 3.7, 3.55);
  cabinet(root, -5.75, -6.35, 3.5);
  books(root, [-6.9, 1, -6.2], 9);
  vase(root, [-4.5, 1, -6.18]);
  const liftSide = group('Lift directory pedestal', root, [5.35, 0, -3.4]);
  box(liftSide, [.54, 1.3, .34], 'stone', [0, .65, 0]);
  const top = box(liftSide, [.62, .065, .42], 'navy', [0, 1.32, .04]);
  top.rotation.x = .2;
  sign(liftSide, ['01 / 02 / 03', 'EXPLORE'], [0, 1.15, .219], .48, .35, {
    colour: '#1c3448'
  });
  target(liftSide, {
    type: 'directory'
  });
  for (const x of [-1.45, 1.45]) pendant(root, [x, 4.3, -3.3], .46);
  sign(root, ['WELCOME TO THE SHOWROOM'], [-5.75, 3.8, -6.77], 3.4, .23, {
    colour: '#92795a'
  });
  companyGallery(a);
  target(reception, { type: 'company', id: 'company' });
  return a;
}
