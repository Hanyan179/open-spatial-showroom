import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { normalizeCompanyLife, containedSize, mediaText, nextPlayableIndex } from '../src/spatial/company-life.js';
import { buildScene } from '../src/spatial/build-scenes.js';
import { batchScene } from '../src/spatial/batch-scene.js';
import { disposeGroup } from '../src/spatial/runtime.js';
test('company media can move to an API; relative assets resolve there, unsafe and duplicate entries fail', async () => {
  const data = normalizeCompanyLife({
    photos: [{
      id: 'photo',
      src: 'images/team.jpg'
    }],
    videos: [{
      id: 'film',
      src: '/films/day.mp4',
      poster: 'poster.jpg'
    }]
  }, 'https://media.example/api/life.json');
  assert.equal(data.photos[0].src, 'https://media.example/api/images/team.jpg');
  assert.equal(data.videos[0].src, 'https://media.example/films/day.mp4');
  assert.throws(() => normalizeCompanyLife({
    photos: [{
      id: 'a',
      src: 'javascript:alert(1)'
    }],
    videos: []
  }));
  assert.throws(() => normalizeCompanyLife({
    photos: [{
      id: 'a',
      src: '/a.jpg'
    }],
    videos: [{
      id: 'a',
      src: '/b.mp4'
    }]
  }));
  assert.throws(() => normalizeCompanyLife({
    photos: []
  }));
  assert.deepEqual(normalizeCompanyLife({
    photos: [],
    videos: []
  }), {
    photos: [],
    videos: []
  });
  assert.equal(mediaText({
    zh: '公司',
    en: 'Company'
  }, 'en'), 'Company');
});
test('portrait, landscape and square media remain complete and undistorted inside the screen', async () => {
  for (const [w, h] of [[1920, 1080], [800, 1200], [1000, 1000]]) {
    const [x, y] = containedSize(w, h, 2.36, 1.3275);
    assert(x <= 2.36 + 1e-9 && y <= 1.3275 + 1e-9);
    assert(Math.abs(x / y - w / h) < 1e-9);
  }
});
test('TV skips failed films without an infinite retry when all media is missing', async () => {
  assert.equal(nextPlayableIndex(3, 0, new Set([1])), 2);
  assert.equal(nextPlayableIndex(3, 2, new Set([1])), 0);
  assert.equal(nextPlayableIndex(3, 0, new Set([1, 2])), 0);
  assert.equal(nextPlayableIndex(3, 1, new Set([0, 1, 2])), -1);
  assert.equal(nextPlayableIndex(0, 0, new Set()), -1);
});
test('physical media mounts survive batching with distinct clicks; no company media is invented', async () => {
  const {
    root
  } = await buildScene('lobby');
  batchScene(root);
  const mounts = [],
    actions = [];
  root.traverse(o => {
    if (o.userData.mediaSurface) mounts.push(o.userData.mediaSurface);
    if (o.isMesh && o.userData.action?.type === 'life') actions.push(o.userData.action);
  });
  assert.equal(mounts.filter(m => m.kind === 'photo').length, 4);
  assert.equal(mounts.filter(m => m.kind === 'video').length, 1);
  assert(actions.some(a => a.kind === 'videos'));
  for (let i = 0; i < 4; i++) assert(actions.some(a => a.kind === 'photos' && a.index === i));
  disposeGroup(root);
  const feed = JSON.parse(await fs.readFile(new URL('../public/data/company-life.json', import.meta.url)));
  assert.deepEqual(feed, {
    photos: [],
    videos: []
  });
});
