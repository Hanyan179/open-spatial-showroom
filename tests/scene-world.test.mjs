import { walkObstacles } from '../src/spatial/walk-obstacles.js';
import { signLines, untranslatedSign } from '../src/spatial/sign-language.js';
import { webUrl, fetchJson } from '../src/spatial/resource-client.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as T from 'three';
import { SCENES, FLOORS, TOUR, parseRoute, legacyContent, sceneView, restoredView, STATE_VERSION, nextTourStop, TOUR_POINTS, tourDwell } from '../src/spatial/catalog.js';
import { REGION_JOURNEYS, isRegional } from '../src/spatial/regional-journeys.js';
import { liftPath, exitPath, roomPath, pathSampler, roundedPath, CAMERA_CLEARANCE, planWalk, segmentClear, travelProgress } from '../src/spatial/paths.js';
import { transitionMode, routePoint, routePose, globePoint, flightRegion } from '../src/spatial/global-flight.js';
import { buildScene } from '../src/spatial/build-scenes.js';
import { SceneCache, disposeGroup, withoutRefractiveShells, signCanvasSize } from '../src/spatial/runtime.js';
test('three active storeys, stable room identities, and an excluded data reserve', async () => {
  assert.deepEqual(FLOORS.filter(f => f.enabled !== false).map(f => f.number), [1, 2, 3]);
  assert.equal(FLOORS.find(f => f.id === 'data').enabled, false);
  assert.deepEqual(TOUR.filter(id=>['lobby','beauty','play','party','office','china','usa','cambodia'].includes(id)), ['lobby','beauty','play','party','office','china','usa','cambodia']);
  assert.equal(new Set(TOUR).size, TOUR.length);
  for (const [id, room] of Object.entries(SCENES)) {
    assert(FLOORS.some(f => f.id === room.floor && f.enabled !== false));
    assert.equal(room.resource, id);
    assert(room.points.length > 0);
    assert.equal(new Set(room.points.map(p => p.id)).size, room.points.length);
  }
  for (const id of ['beauty', 'play', 'party']) assert.equal(SCENES[id].floor, 'products');
});
test('legacy links migrate to meaningful rooms and invalid saved positions are rejected', async () => {
  for (const [old, next] of Object.entries({
    welcome: 'lobby',
    upper: 'lobby',
    honors: 'lobby',
    toys: 'play',
    gallery: 'beauty',
    supply: 'cambodia',
    observatory: 'office'
  })) assert.equal(parseRoute('#/' + old).scene, next);
  assert.deepEqual(parseRoute('#/lobby/entrance'), {
    scene: 'lobby',
    point: 'entrance'
  });
  assert.deepEqual(legacyContent('#/gallery/collection'), {
    type: 'catalog',
    section: 'products'
  });
  assert.equal(legacyContent('#/honors').id, 'culture');
  assert.equal(legacyContent('#/beauty/product/lipstick').id, 'lipstick');
  assert.equal(parseRoute('#/unknown').scene, 'lobby');
  assert.equal(parseRoute('#/beauty/wall').point, 'overview');
  const bad = {
    'lobby/overview': {
      position: [0, 42, -15],
      look: [0, 0, 0]
    }
  };
  assert.deepEqual(restoredView(bad, 'lobby', 'overview'), SCENES.lobby.overview);
  const pose = {
    position: [.1, 2, 10.25],
    look: [0, 2, -3]
  };
  assert.equal(restoredView({
    'lobby/overview': pose
  }, 'lobby', 'overview'), pose);
  assert.deepEqual(restoredView({
    'lobby/overview': {
      position: [8.2, 1.8, 1],
      look: [0, 2, -3]
    }
  }, 'lobby', 'overview'), SCENES.lobby.overview, 'obsolete free-walk poses cannot restore into a cabinet');
  assert(STATE_VERSION !== 'scene-world-v2');
});
test('camera paths stay inside the architecture and clear actual furniture geometry', async () => {
  let checked = 0;
  for (const [id, spec] of Object.entries(SCENES)) {
    const {
      root
    } = await buildScene(id);
    root.updateMatrixWorld(true);
    const solids = [];
    root.traverse(o => {
      if (o.isMesh && !o.material.transparent) {
        o.geometry.computeBoundingBox();
        const box = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
        if (box.max.y > .18 && box.min.y < 2.2) solids.push({
          box,
          name: o.parent.name || 'structure'
        });
      }
    });
    root.traverse(o => {
      if (o.userData.sample) {
        const p = o.getWorldPosition(new T.Vector3()),
          h = o.userData.sample.height;
        solids.push({
          box: new T.Box3(new T.Vector3(p.x - h / 2, p.y, p.z - h / 2), new T.Vector3(p.x + h / 2, p.y + h, p.z + h / 2)),
          name: 'runtime sample ' + o.userData.sample.id
        });
      }
    });
    const views = {
      overview: spec.overview,
      ...Object.fromEntries(spec.points.map(p => [p.id, p.camera])),
      ...spec.extraViews
    };
    for (const [name, view] of Object.entries(views)) for (const [kind, path] of [['lift', liftPath(view, id)], ['exit', exitPath(view, id)], ...Object.entries(views).filter(([k]) => k !== name).map(([k, v]) => [k, roomPath(id, view, v)])]) {
      const walk = pathSampler(planWalk(path, walkObstacles(root))),
        steps = Math.ceil(walk.length / .25);
      for (let i = 0; i <= steps; i++) {
        const p = walk.at(i / steps);
        assert(p.every(Number.isFinite));
        assert(Math.abs(p[0]) <= 8.6);
        assert(p[2] <= 11);
        if (p[2] < -6.7 && (!isRegional(id) || p[0] > 5)) {
          assert(p[0] - CAMERA_CLEARANCE > 5.45 && p[0] + CAMERA_CLEARANCE < 7.95 && p[2] - CAMERA_CLEARANCE > -9.55, 'camera stays inside the actual cabin');
        } else if (isRegional(id)) {
          assert(p[2] > -29, 'camera stays inside the promenade');
        }
        const body = new T.Box3(new T.Vector3(p[0] - CAMERA_CLEARANCE, .19, p[2] - CAMERA_CLEARANCE), new T.Vector3(p[0] + CAMERA_CLEARANCE, p[1] + .12, p[2] + CAMERA_CLEARANCE));
        const hit = solids.find(o => o.box.intersectsBox(body));
        assert(!hit, `${id}/${name} to ${kind} intersects ${hit?.name} at ${p}`);
        checked++;
      }
    }
    const materials = new Set();
    root.traverse(o => {
      o.geometry?.dispose();
      if (o.material) materials.add(o.material);
    });
    materials.forEach(m => m.dispose());
  }
  assert(checked > 1000);
});
test('regional tours visit every physical stage before leaving and preserve opposite-side views', async () => {
  for (const [id, j] of Object.entries(REGION_JOURNEYS)) {
    let at = {
      scene: id,
      point: 'overview'
    };
    for (const step of j.steps) {
      at = nextTourStop(at.scene, at.point);
      assert.deepEqual(at, {
        scene: id,
        point: step.id
      });
      at = nextTourStop(at.scene, at.point);
      assert.deepEqual(at, {
        scene: id,
        point: step.id + '-opposite'
      });
    }
    assert.notEqual(nextTourStop(at.scene, at.point).scene, id);
    assert.deepEqual(nextTourStop(id, j.steps[0].id + '-opposite'), {
      scene: id,
      point: j.steps[1].id
    });
    const first = SCENES[id].points[0].camera,
      last = SCENES[id].points[2].camera;
    assert(first.position[2] - last.position[2] >= 24, 'stages occupy separate sections along the route');
    for (const step of j.steps) {
      const opposite = sceneView(id, step.id + '-opposite');
      assert(opposite.look[0] > 0);
      assert(sceneView(id, step.id).look[0] < 0);
      assert.equal(parseRoute('#/' + id + '/' + step.id + '-opposite').point, step.id + '-opposite');
      assert.equal(restoredView({
        [id + '/' + step.id + '-opposite']: opposite
      }, id, step.id + '-opposite'), opposite);
    }
  }
});
test('scene cache de-duplicates loads, keeps current/previous/next, disposes older scenes, and retries failures', async () => {
  const loaded = [],
    disposed = [];
  let fail = true;
  const cache = new SceneCache(async id => {
    loaded.push(id);
    if (id === 'error' && fail) throw Error('offline asset');
    return {
      id
    };
  }, o => disposed.push(o.id), 3);
  cache.protect(['a']);
  const [a, b] = await Promise.all([cache.get('a'), cache.get('a')]);
  assert.equal(a, b);
  assert.equal(loaded.length, 1);
  for (const id of ['b', 'c']) await cache.get(id);
  cache.protect(['b', 'c', 'd']);
  await cache.get('d');
  assert.deepEqual([...cache.entries.keys()], ['b', 'c', 'd']);
  assert.deepEqual(disposed, ['a']);
  await assert.rejects(cache.get('error'));
  assert(!cache.entries.has('error'));
  fail = false;
  cache.protect(['c', 'd', 'error']);
  assert.equal((await cache.get('error')).id, 'error');
  assert.equal(cache.entries.size, 3);
  cache.clear();
  await new Promise(r => setImmediate(r));
  assert(disposed.includes('c') && disposed.includes('d') && disposed.includes('error'));
});
test('exported rooms are separate geometry assets with correct identities and honest concept metadata', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../public/models/scenes/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.scenes.length, Object.keys(SCENES).length);
  for (const room of manifest.scenes) {
    const b = await fs.readFile(new URL('../public/models/scenes/' + room.file, import.meta.url));
    assert.equal(b.toString('ascii', 0, 4), 'glTF');
    assert.equal(b.readUInt32LE(8), b.length);
    assert.equal(b.length, room.bytes);
    assert(b.length < 11 * 1024 * 1024);
    const doc = JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));
    assert(doc.nodes.some(n => n.extras?.sceneId === room.id && n.extras?.concept === true));
    assert(!doc.images?.length, 'room background must remain geometric');
  }
});
test('example taxonomy and media are available locally', async () => {
  const base = new URL('../vendor/explorer/public/', import.meta.url),
    read = async n => JSON.parse(await fs.readFile(new URL('shared/' + n + '.json', base), 'utf8'));
  const catalog = await read('catalog');
  assert.deepEqual([catalog.brands.length, catalog.categories.length, catalog.subcategories.length], [0, 3, 8]);
  const products = await read('concepts'),
    styles = await read('product-skus');
  assert.equal(products.items.length, 8);
  assert.equal(styles.items.length, 14);
  for (const style of styles.items) {
    assert(style.media.images.length >= 3);
    for (const im of style.media.images) await fs.access(new URL(im.src, base));
    if (style.media.video) await fs.access(new URL(style.media.video, base));
  }
  assert.equal(products.items.filter(p => p.brandId).length, 0, 'concept samples must not invent brand relationships');
});
test('disposing a room frees sample-label maps and mirror targets as well as meshes', async () => {
  const root = new T.Group(),
    map = new T.Texture(),
    geometry = new T.BoxGeometry(),
    material = new T.MeshStandardMaterial({
      map
    });
  let textures = 0,
    geometries = 0,
    materials = 0;
  map.addEventListener('dispose', () => textures++);
  geometry.addEventListener('dispose', () => geometries++);
  material.addEventListener('dispose', () => materials++);
  root.add(new T.Mesh(geometry, material));
  disposeGroup(root);
  assert.deepEqual([textures, geometries, materials], [1, 1, 1]);
});
test('reflection skips only visible refractive shells and restores them even after failure', async () => {
  const scene = new T.Scene(),
    shell = new T.Mesh(new T.BoxGeometry(), new T.MeshPhysicalMaterial({
      transmission: .4
    })),
    solid = new T.Mesh(new T.BoxGeometry(), new T.MeshStandardMaterial()),
    alreadyHidden = shell.clone();
  alreadyHidden.visible = false;
  scene.add(shell, solid, alreadyHidden);
  assert.throws(() => withoutRefractiveShells(scene, () => {
    assert.equal(shell.visible, false);
    assert.equal(solid.visible, true);
    throw Error('reflection failed');
  }), /reflection failed/);
  assert.equal(shell.visible, true);
  assert.equal(alreadyHidden.visible, false);
  disposeGroup(scene);
});
test('headquarters and China remain local; only overseas journeys fly', async () => {
  const local = ['lobby', 'beauty', 'play', 'party', 'office', 'china'];
  for (const a of local) for (const b of local) assert.equal(transitionMode(a, b), a === b ? 'walk' : 'lift');
  for (const a of [...local, 'usa', 'cambodia']) for (const b of ['usa', 'cambodia']) {
    assert.equal(transitionMode(a, b), a === b ? 'walk' : 'flight');
    assert.equal(transitionMode(b, a), a === b ? 'walk' : 'flight');
  }
  for (const a of local) assert.equal(flightRegion(a), 'china');
  assert.equal(flightRegion('usa'), 'usa');
  assert.equal(flightRegion('cambodia'), 'cambodia');
  for (const [a, b] of [['china', 'usa'], ['usa', 'cambodia'], ['cambodia', 'china']]) {
    assert(routePoint(a, b, 0).clone().normalize().distanceTo(globePoint(a)) < 1e-6);
    assert(routePoint(a, b, 1).clone().normalize().distanceTo(globePoint(b)) < 1e-6);
    for (let i = 0; i <= 100; i++) {
      const p = routePoint(a, b, i / 100);
      assert(p.toArray().every(Number.isFinite));
      assert(p.length() > 12.3, 'flight stays above the Earth surface');
    }
  }
});
test('aircraft nose follows the route in both directions even under a rotating translated globe', async () => {
  for (const from of ['china', 'usa', 'cambodia']) for (const to of ['china', 'usa', 'cambodia']) if (from !== to) {
    const globe = new T.Group(),
      jet = new T.Group();
    globe.add(jet);
    globe.position.set(0, -3, 0);
    for (let i = 0; i <= 100; i++) {
      const u = i / 100,
        {
          position,
          quaternion
        } = routePose(from, to, u);
      globe.quaternion.setFromUnitVectors(position.clone().normalize(), new T.Vector3(0, .04, 1).normalize());
      jet.position.copy(position);
      jet.quaternion.copy(quaternion);
      globe.updateMatrixWorld(true);
      const start = globe.localToWorld(routePoint(from, to, Math.max(0, u - .0001))),
        end = globe.localToWorld(routePoint(from, to, Math.min(1, u + .0001))),
        direction = end.sub(start).normalize();
      const nose = new T.Vector3(0, 0, 1).applyQuaternion(jet.getWorldQuaternion(new T.Quaternion()));
      assert(nose.dot(direction) > .99999, `${from}→${to} at ${u}: nose must face forward`);
      const up = new T.Vector3(0, 1, 0).applyQuaternion(quaternion);
      assert(up.dot(position.clone().normalize()) > .9, 'wings stay upright above the Earth');
    }
  }
});
test('3D signs keep their physical aspect ratio instead of stretching Chinese glyphs', async () => {
  for (const [w, h] of [[7, .23], [7, .5], [2.4, .43], [.48, .35]]) {
    const c = signCanvasSize(w, h);
    assert(Math.abs(c.width / c.height - w / h) / (w / h) < .01);
    assert(c.width <= 4096);
  }
});
test('guided visits include close-ups, every bay side and varied reading time', async () => {
  const expected = Object.values(TOUR_POINTS).reduce((n, p) => n + p.length, 0),
    seen = new Set();
  let stop = {
    scene: 'lobby',
    point: 'overview'
  };
  for (let i = 0; i < expected; i++) {
    const key = stop.scene + '/' + stop.point;
    assert(!seen.has(key));
    seen.add(key);
    assert.equal(parseRoute('#/' + key).point, stop.point);
    assert(tourDwell(stop.scene, stop.point) >= 5000);
    stop = nextTourStop(stop.scene, stop.point);
  }
  assert.deepEqual(stop, {
    scene: 'lobby',
    point: 'overview'
  });
  assert(seen.has('beauty/serum'));
  assert(seen.has('lobby/lounge'));
  assert(seen.has('office/earth'));
  assert(tourDwell('beauty', 'serum') > tourDwell('beauty', 'overview'));
});
test('physical text has both languages', async () => {
  let total = 0;
  for (const id of TOUR) {
    const {
      root
    } = await buildScene(id);
    root.traverse(o => {
      const sign = o.userData.sign;
      if (!sign) return;
      total++;
      assert.deepEqual(untranslatedSign(sign), [], id + ': ' + JSON.stringify(sign));
      assert(!/[\u3400-\u9fff]/u.test(signLines(sign, 'en').join(' ')), id + ' English signs');
    });
    disposeGroup(root);
  }
  assert(total > 100);
  assert.deepEqual(signLines({
    text: ['COLOUR ATELIER', '美妆与护理']
  }, 'zh'), ['美妆与护理']);
  assert.deepEqual(signLines({
    text: ['电梯', 'ELEVATOR']
  }, 'en'), ['ELEVATOR']);
  assert.deepEqual(signLines({
    text: ['SHOWROOM', 'GLOBAL CONNECTIONS']
  }, 'zh'), ['展厅', '全球连接']);
});
test('navigation shortens visible routes, keeps furniture clearance, and eases speed without reversal', async () => {
  const direct = [[0, 1.8, 6], [0, 1.8, 3], [4, 1.8, 3], [4, 1.8, 0]],
    clear = planWalk(direct, []);
  assert.equal(clear.length, 2);
  assert.equal(segmentClear(direct[0], direct.at(-1), [[1, 1, 3, 5]]), false);
  let prev = 0;
  for (let i = 0; i <= 100; i++) {
    const p = travelProgress(i / 100);
    assert(p >= prev && p <= 1);
    prev = p;
  }
  assert.equal(travelProgress(0), 0);
  assert.equal(travelProgress(1), 1);
  assert(travelProgress(.01) < .001);
});
test('connected feeds remain replaceable and news stays empty rather than inventing stories', async () => {
  const config = JSON.parse(await fs.readFile(new URL('../public/showroom.config.json', import.meta.url))),
    data = JSON.parse(await fs.readFile(new URL('../public/data/resources.json', import.meta.url)));
  assert(config.content.companyUrl && config.content.resourcesUrl);
  assert.equal(data.news.length, 0);
  assert.deepEqual(data.partners.map(p => p.id), ['partner-1', 'partner-2', 'partner-3']);
  for (const url of Object.values(config.external.productCategories)) assert.equal(url,null);
  assert.equal(webUrl('javascript:alert(1)'), null);
  assert.equal(webUrl('data:text/html,x'), null);
  assert.equal(webUrl(''), null);
  const prior = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => ({
      ok: true,
      json: async () => ({
        url,
        credentials: options.credentials
      })
    });
    const value = await fetchJson('https://content.example/api/news');
    assert.equal(value.url, 'https://content.example/api/news');
    assert.equal(value.credentials, 'same-origin');
    globalThis.fetch = async () => ({
      ok: false,
      status: 503
    });
    await assert.rejects(fetchJson('https://content.example/api/news'), /503/);
  } finally {
    globalThis.fetch = prior;
  }
});
