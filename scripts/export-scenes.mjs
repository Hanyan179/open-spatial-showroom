import fs from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { batchScene } from '../src/spatial/batch-scene.js';
import { buildScene } from '../src/spatial/build-scenes.js';
import { SCENES, FLOORS } from '../src/spatial/catalog.js';
import { walkObstacles } from '../src/spatial/walk-obstacles.js';
globalThis.FileReader = class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};
await fs.mkdir('public/models/scenes', {
  recursive: true
});
const manifest = {
  version: 2,
  units: 'metres',
  concept: true,
  floors: FLOORS,
  scenes: []
};
for (const id of Object.keys(SCENES)) {
  const {
    root
  } = await buildScene(id);
  root.updateMatrixWorld(true);
  root.userData.walkObstacles = walkObstacles(root);
  const batchCount = batchScene(root);
  const data = await new GLTFExporter().parseAsync(root, {
    binary: true,
    onlyVisible: true
  });
  await fs.writeFile(`public/models/scenes/${SCENES[id].resource}.glb`, Buffer.from(data));
  manifest.scenes.push({
    id,
    file: `${SCENES[id].resource}.glb`,
    bytes: data.byteLength,
    materialBatches: batchCount
  });
  console.log(id, Math.round(data.byteLength / 1024) + ' KB', batchCount + ' batches');
}
await fs.writeFile('public/models/scenes/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
