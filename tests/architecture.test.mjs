import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { SCENE_DEFINITIONS, FLOORS, REGISTRY, SCENES } from '../src/spatial/core/scene-registry.js';
import { createSceneRegistry } from '../src/spatial/core/registry.js';
import { ACTIONS } from '../src/spatial/core/action-contracts.js';
import { ACTION_HANDLERS, resolveAction, hotspotDestination } from '../src/spatial/core/action-router.js';
import { contentLinkErrors, worldContentErrors } from '../src/spatial/core/content-links.js';
import { VisitSession } from '../src/spatial/core/visit-session.js';
import { localized, normalizeLanguage } from '../src/spatial/core/i18n.js';
import { tourDecision } from '../src/spatial/host/use-guided-tour.js';
import { checkArchitecture } from '../scripts/check-architecture.mjs';
const clone = () => structuredClone(SCENE_DEFINITIONS);
const fixture = () => ({
  ...structuredClone(SCENES.beauty),
  id: 'new-atelier',
  resource: 'new-atelier',
  domain: 'new-domain',
  aliases: ['new-room']
});
test('one scene registration derives directory, tour, aliases, product domain and viewpoints', () => {
  const s = fixture(),
    r = createSceneRegistry([...clone(), s], FLOORS);
  assert(r.directory.find(f => f.id === 'products').rooms.some(v => v.id === s.id));
  assert.equal(r.tour.at(-1), s.id);
  assert.equal(r.aliases['new-room'], s.id);
  assert(r.domains.includes(s.domain));
  assert(r.hasView(s.id, 'serum'));
  const reserved = createSceneRegistry([...clone(), {
    ...s,
    floor: 'data'
  }], FLOORS);
  assert(!reserved.scenes[s.id]);
  assert(!reserved.tour.includes(s.id));
  assert(!reserved.domains.includes(s.domain));
});
test('incomplete or ambiguous room extensions fail with specific diagnostics', () => {
  const cases = [[s => s.name = ['只有中文'], /both languages/], [s => s.tour.push('wall'), /unknown tour stop/], [s => s.points[0].action = {
    type: 'forgotten'
  }, /unknown action/], [s => s.resource = '../escape', /model and resource/], [s => s.aliases = ['office'], /alias collides/], [s => s.points[0].camera.position[0] = NaN, /invalid camera/], [s => s.extraViews = {
    overview: s.overview
  }, /duplicate viewpoint/], [s => s.navigation = null, /navigation layout/], [s => s.domain = 'beauty', /duplicate product domain/]];
  for (const [mutate, pattern] of cases) {
    const s = fixture();
    mutate(s);
    assert.throws(() => createSceneRegistry([...clone(), s], FLOORS), pattern);
  }
});
test('all action types have handlers; malformed or unknown actions cannot disappear silently', () => {
  assert.deepEqual(Object.keys(ACTIONS).sort(), Object.keys(ACTION_HANDLERS).sort());
  assert.throws(() => resolveAction({
    type: 'missing'
  }, 'lobby'), /unknown/);
  assert.throws(() => resolveAction({
    type: 'roomProducts'
  }, 'beauty'), /requires id/);
  assert.deepEqual(resolveAction({
    type: 'roomProducts',
    id: 'beauty-lip-balm'
  }, 'beauty'), {
    kind: 'panel',
    panel: {
      type: 'roomProducts',
      id: 'beauty-lip-balm',
      domain: 'beauty'
    }
  });
  assert.equal(resolveAction({
    type: 'market',
    id: 'usa'
  }, 'office').scene, 'usa');
  assert.equal(resolveAction({
    type: 'market',
    id: 'europe'
  }, 'office').panel.type, 'europe');
});
test('model actions walk to the correct exhibit and regional opposite view without prematurely opening details', () => {
  const product = {
    type: 'roomProducts',
    id: 'play-telescope'
  };
  assert.equal(hotspotDestination(product, 'play', 'overview').point, 'puzzle');
  assert.equal(hotspotDestination({
    type: 'life',
    kind: 'photos',
    at: 'culture'
  }, 'lobby', 'overview').point, 'culture');
  assert.equal(hotspotDestination({
    type: 'life',
    kind: 'photos',
    at: 'culture'
  }, 'lobby', 'culture'), null);
  assert.deepEqual(hotspotDestination({
    type: 'region',
    id: 'china',
    chapter: 1,
    side: 'right'
  }, 'china', 'overview'), {
    scene: 'china',
    point: 'research-opposite',
    action: { type: 'region', id: 'china', chapter: 1, side: 'right' }
  });
});
test('rapid navigation only executes the latest pending content action and preserves back destinations', () => {
  const s = new VisitSession(),
    from = {
      scene: 'lobby',
      point: 'reception'
    };
  const first = s.issue(from, {
    scene: 'beauty',
    point: 'lipstick'
  }, {
    type: 'roomProducts',
    id: 'old'
  });
  const final = s.issue(from, {
    scene: 'play',
    point: 'puzzle'
  }, {
    type: 'roomProducts',
    id: 'latest'
  });
  assert.equal(s.history.length, 1, 'consecutive clicks do not duplicate the same back destination');
  assert.equal(s.arrive(first.request), null);
  assert.equal(s.arrive(final.request).id, 'latest');
  assert.equal(s.arrive(final.request), null, 'arrival consumes the action once');
  assert.deepEqual(s.back(), from);
  s.issue(from, {
    scene: 'party',
    point: 'gift'
  }, {
    type: 'roomProducts',
    id: 'cancel'
  });
  s.cancel();
  assert.equal(s.pending, null);
});
test('tour pauses for content, loading and hidden windows; idle resumes at 90 seconds', () => {
  const state = {
    ready: true,
    auto: false,
    actual: 'beauty',
    point: 'overview',
    stage: 'idle'
  };
  assert.equal(tourDecision(state, 89999, {
    idle: 0,
    dwell: 0
  }), null);
  assert.deepEqual(tourDecision(state, 90000, {
    idle: 0,
    dwell: 0
  }), {
    type: 'resume'
  });
  for (const override of [{
    panel: {}
  }, {
    menu: true
  }, {
    hidden: true
  }, {
    stage: 'flight'
  }, {
    ready: false
  }]) assert.equal(tourDecision({
    ...state,
    ...override
  }, 999999, {
    idle: 0,
    dwell: 0
  }), null);
  assert.deepEqual(tourDecision({
    ...state,
    auto: true
  }, 8000, {
    idle: 0,
    dwell: 0
  }), {
    type: 'navigate',
    scene: 'beauty',
    point: 'lipstick'
  });
});
test('scene labels and feed labels share language selection and invalid stored languages normalize', () => {
  assert.equal(localized(['中文', 'English'], 'en'), 'English');
  assert.equal(localized({
    zh: '中文',
    en: 'English'
  }, 'en'), 'English');
  assert.equal(localized('SHOWROOM', 'en'), 'SHOWROOM');
  assert.equal(normalizeLanguage('unknown'), 'zh');
});
test('new image products share an existing display point; broken content relationships fail validation', async () => {
  const products = JSON.parse(await fs.readFile(new URL('../public/data/room-products.json', import.meta.url))).products;
  const concepts = JSON.parse(await fs.readFile(new URL('../vendor/explorer/public/shared/concepts.json', import.meta.url))).items;
  const extra = {
    ...products[0],
    id: 'extra-image-only-product'
  };
  assert.deepEqual(worldContentErrors(REGISTRY, [...products, extra], concepts), []);
  assert(worldContentErrors(REGISTRY, [...products, {
    ...extra,
    point: 'missing'
  }], concepts).some(e => e.includes('missing exhibit')));
  assert(contentLinkErrors({
    type: 'roomProducts',
    id: products[0].id
  }, 'play', REGISTRY, products, concepts).some(e => e.includes('another domain')));
  assert(contentLinkErrors({
    type: 'region',
    id: 'china',
    chapter: 99
  }, 'china', REGISTRY, products, concepts).length);
});
test('complete runtime dependency graph and exported scene/content contracts are valid', async () => {
  const report = await checkArchitecture();
  assert.deepEqual(report.errors, []);
  assert.equal(report.scenes, Object.keys(SCENES).length);
  assert(report.activeModules > 20);
});


test('registered room features release once and roll back partial installation on failure',async()=>{
 const {installRoomFeatures}=await import('../src/spatial/room-features.js');
 const log=[],root={};
 installRoomFeatures(root,{a:()=>({dispose:()=>log.push('a')}),b:()=>({dispose:()=>log.push('b')})});
 root.disposeFeatures();root.disposeFeatures();assert.deepEqual(log,['b','a']);
 assert.throws(()=>installRoomFeatures({}, {a:()=>({dispose:()=>log.push('rollback')}),b:()=>{throw Error('failed mount');}}),/failed mount/);
 assert.equal(log.at(-1),'rollback');
});


test('embedded explorer cannot reset host language with startup or stale language echoes',async()=>{
 const {LanguageHandshake,isExplorerMessage,EXPLORER_CHANNEL}=await import('../src/spatial/core/explorer-protocol.js');
 const sync=new LanguageHandshake();assert.equal(sync.accept('zh'),false);
 sync.ready=true;sync.expect('en');assert.equal(sync.accept('zh'),false);assert.equal(sync.accept('en'),true);
 sync.expect('zh');assert.equal(sync.accept('en'),false);assert.equal(sync.accept('zh'),true);
 sync.reset();assert.equal(sync.accept('en'),false);
 const source={},event={source,origin:'http://localhost',data:{channel:EXPLORER_CHANNEL,version:1}};
 assert(isExplorerMessage(event,source,'http://localhost'));
 assert(!isExplorerMessage(event,{},'http://localhost'));assert(!isExplorerMessage({...event,origin:'https://foreign.example'},source,'http://localhost'));
});
