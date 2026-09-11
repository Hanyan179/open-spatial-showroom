import test from 'node:test';
import assert from 'node:assert/strict';
import { presenterDestination, presenterKey, presenterPoint } from '../src/spatial/core/presenter-controls.js';
import { TOUR, TOUR_POINTS, SCENES } from '../src/spatial/core/scene-registry.js';

test('presenter navigation follows every registered tour stop in both directions', () => {
  const route = TOUR.flatMap(scene => TOUR_POINTS[scene].map(point => ({ scene, point })));
  for (let i = 0; i < route.length; i++) {
    const { scene, point } = route[i];
    assert.deepEqual(presenterDestination(scene, point, 1), route[(i + 1) % route.length]);
    assert.deepEqual(presenterDestination(scene, point, -1), route[(i - 1 + route.length) % route.length]);
  }
  assert.deepEqual(presenterDestination('lobby','entrance',1),route[1]);
  assert.equal(presenterPoint('samples','play').action.id,'play');
  assert.equal(presenterPoint('play','overview'),undefined);
  for (const scene of Object.values(SCENES)) for (const p of scene.points) assert.equal(presenterPoint(scene.id,p.id),p);
});

test('presentation keys respect dialogs, input, repeat presses, and native focused buttons', () => {
  for (const key of ['ArrowRight','PageDown','Enter','p',' ','m','Escape']) {
    for (const flag of ['editing','overlay','repeat','modified']) assert.equal(presenterKey(key,{[flag]:true}),null);
    assert.equal(presenterKey(key,{ready:false}),null);
  }
  assert.equal(presenterKey('Enter',{interactive:true}),null);
  assert.equal(presenterKey(' ',{interactive:true}),null);
  assert.equal(presenterKey('ArrowRight',{interactive:true}),null);
  assert.equal(presenterKey('PageDown',{interactive:true}),'next');
  assert.equal(presenterKey('PageUp',{interactive:true}),'previous');
  for (const key of ['ArrowLeft','ArrowRight','PageDown','PageUp','Enter']) assert.equal(presenterKey(key,{moving:true}),null);
  assert.equal(presenterKey('P',{moving:true}),'play');
  assert.equal(presenterKey('M'),'menu');
  assert.equal(presenterKey('Escape'),'back');
  assert.equal(presenterKey('Tab'),null);
});
