import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { buildScene } from '../src/spatial/build-scenes.js';
import { SCENES } from '../src/spatial/core/scene-registry.js';
import { createRoomAmbient } from '../src/spatial/ambient.js';
import { disposeGroup } from '../src/spatial/runtime.js';

test('birthday title remains clear from room viewpoints throughout balloon sway', async () => {
  const { root } = await buildScene('party');
  const ambient = createRoomAmbient(root);
  try {
    let title;
    const balloons = [];
    root.traverse(node => {
      if (node.userData.sign?.text.includes('生日与庆祝')) title = node;
      if (node.parent?.name === 'Tethered celebration balloon' && node.geometry?.type === 'SphereGeometry') balloons.push(node);
    });
    assert(title, 'room title must exist');
    assert(balloons.length > 0, 'celebration balloons remain part of the room');
    const viewpoints = [SCENES.party.overview, ...SCENES.party.points.map(p => p.camera)];
    const { w, h } = title.userData.sign;
    // Cover the whole bilingual sign mount plus a small reading margin, not only
    // its centre. Low and side viewpoints reveal parallax hidden in a front view.
    const targets = [];
    root.updateMatrixWorld(true);
    for (let x = 0; x <= 12; x++) for (let y = 0; y <= 4; y++) {
      targets.push(title.localToWorld(new T.Vector3((x / 12 - .5) * (w + .08), (y / 4 - .5) * (h + .08), 0)));
    }
    const spheres = balloons.map(balloon => {
      balloon.geometry.computeBoundingSphere();
      const sphere = balloon.geometry.boundingSphere.clone();
      sphere.radius += .025;
      return sphere;
    });
    const hit = new T.Vector3();
    // Sample two minutes of the real shared animation, including differing
    // balloon phases. Ray/sphere checks in model space include ellipsoid scale.
    for (let frame = 0; frame <= 2400; frame++) {
      if (frame) ambient.update(.05);
      if (frame % 20) continue;
      root.updateMatrixWorld(true);
      const bounds = balloons.map((b, i) => ({ inverse: b.matrixWorld.clone().invert(), world: b.matrixWorld, sphere: spheres[i] }));
      for (const [index, view] of viewpoints.entries()) {
        const origin = new T.Vector3(...view.position);
        for (const target of targets) {
          const ray = new T.Ray(origin, target.clone().sub(origin).normalize());
          for (const bound of bounds) {
            const localRay = ray.clone().applyMatrix4(bound.inverse);
            if (!localRay.intersectSphere(bound.sphere, hit)) continue;
            const distance = hit.applyMatrix4(bound.world).distanceTo(origin);
            assert(distance >= origin.distanceTo(target), `balloon occludes title at viewpoint ${index}, t=${ambient.time().toFixed(2)}s`);
          }
        }
      }
    }
  } finally {
    ambient.dispose();
    disposeGroup(root);
  }
});
