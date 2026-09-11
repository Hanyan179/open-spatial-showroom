import * as T from 'three';
import { workshop } from '../craft.js';
import { productExhibits } from '../product-room-exhibits.js';
export function roomKit(id) {
  const a = workshop(),
    {
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
      shell
    } = a;
  root.name = 'SHOWROOM · ' + id;
  root.userData = {
    sceneId: id,
    concept: true,
    units: 'metres'
  };
  const products = productExhibits(a);
  const sample = (g, id, p, height = 1) => {
    const m = group('Concept sample · ' + id, g, p);
    m.userData.sample = {
      id,
      height
    };
    return m;
  };
  const finish = (g, x, z, w = 2, h = 2.5, colour = 'wood') => {
    box(g, [w, h, .1], colour, [x, h / 2 + .15, z]);
    for (let i = 0; i < Math.ceil(w / .09); i++) box(g, [.025, h, .03], 'brass', [x - w / 2 + i * .09, h / 2 + .15, z + .063], .008);
  };
  const pendant = (g, p, r = .42) => {
    cylinder(g, .007, 1, 'brass', [p[0], p[1] + .6, p[2]]);
    cylinder(g, r, .18, 'linen', p, r * .9);
    cylinder(g, r * .94, .012, 'light', [p[0], p[1] - .095, p[2]]);
    ring(g, r, .012, 'brass', [p[0], p[1] - .08, p[2]]);
  };
  const cabinet = (g, x, z, w = 3, colour = 'wood') => {
    box(g, [w, .84, .65], colour, [x, .5, z], .025);
    box(g, [w + .06, .06, .7], 'stone', [x, .96, z]);
    box(g, [w-.1,.09,.54], 'navy', [x,.11,z],.008);
    for(let i=0;i<3;i++){const cx=x+(i-1)*w/3;box(g,[w/3-.028,.67,.018],colour,[cx,.51,z+.328],.012);box(g,[.23,.036,.011],'brass',[cx,.7,z+.344],.005);}
    for (let q = -1; q <= 1; q++) {
      box(g, [.008, .65, .009], 'brass', [x + q * w / 4, .49, z + .332], .002);
      box(g, [.2, .015, .045], 'brass', [x + q * w / 3, .7, z + .36], .005);
    }
    return .99;
  };
  const worktable = (g, p, w = 3.4, d = 1.45, colour = 'oak') => {
    const t = group('Development worktable', g, p);
    box(t, [w, .095, d], colour, [0, .86, 0], .04);
    for (const x of [-w / 2 + .25, w / 2 - .25]) for (const z of [-d / 2 + .2, d / 2 - .2]) box(t, [.065, .8, .065], 'navy', [x, .415, z]);
    box(t, [w - .5, .07, .04], 'brass', [0, .2, -d / 2 + .2]);
    return t;
  };
  const screen = (g, p, w = 1.1, h = .65, lines = ['DESIGN', 'SHOWROOM'], display) => {
    box(g, [w, h, .05], 'navy', p, .025);
    box(g, [.05, .24, .045], 'brass', [p[0], p[1] - h / 2 - .1, p[2]]);
    box(g, [.48, .025, .25], 'navy', [p[0], p[1] - h / 2 - .22, p[2]]);
    if(display){const mount=group('Working display mount',g,[p[0],p[1],p[2]+.031]);mount.userData.workingDisplay={w:w-.09,h:h-.08,...display};return mount;}
    sign(g, lines, [p[0], p[1], p[2] + .03], w - .09, h - .08, {
      background: '#173950',
      colour: '#e6dbbe'
    });
  };
  return {
    ...a,
    products,
    sample,
    finish,
    pendant,
    cabinet,
    worktable,
    screen
  };
}
export function productRoomShell(a, id, colour) {
  const {
    root,
    shell,
    group,
    box,
    sign,
    target
  } = a;
  shell(root, {
    colour
  });
  const terminal = group('Showroom product library terminal', root, [5.65, 0, 5.05]);
  box(terminal, [.76, .045, .65], 'brass', [0, .04, 0], .018);
  box(terminal, [.48, 1.25, .32], 'navy', [0, .68, 0], .035);
  box(terminal, [.82, .68, .09], 'stone', [0, 1.43, 0], .03);
  sign(terminal, ['PRODUCT LIBRARY'], [0, 1.48, .05], .72, .19);
  sign(terminal, ['PRODUCT'], [0, 1.24, .05], .4, .09, {
    colour: '#9d835d'
  });
  const terminalLogo = group('Optional identity on library terminal', terminal, [0, 1.93, .025]);
  terminalLogo.userData.identity = {
    width: .7
  };
  target(terminal, {
    type: 'resource',
    id: 'products',
    domain: id
  });
}
