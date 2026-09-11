import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGISTRY, SCENES, sceneResource } from '../src/spatial/core/scene-registry.js';
import { ACTIONS, PANEL_TYPES } from '../src/spatial/core/action-contracts.js';
import { ACTION_HANDLERS } from '../src/spatial/core/action-router.js';
import { worldContentErrors, contentLinkErrors } from '../src/spatial/core/content-links.js';
import { validateRoomProducts } from '../src/spatial/room-products.js';
import { untranslatedSign } from '../src/spatial/sign-language.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = async p => fs.readFile(path.join(root, p), 'utf8');
const json = async p => JSON.parse(await read(p));
const exists = async p => fs.access(path.join(root, p)).then(() => true, () => false);
export async function checkArchitecture() {
  const errors = [],
    graph = new Map();
  const products = validateRoomProducts(await json('public/data/room-products.json')).products;
  const concepts = (await json('vendor/explorer/public/shared/concepts.json')).items;
  errors.push(...worldContentErrors(REGISTRY, products, concepts));
  for (const type of Object.keys(ACTIONS)) if (typeof ACTION_HANDLERS[type] !== 'function') errors.push(`action handler missing: ${type}`);
  const panelSource = await read('src/spatial/ui/ContentPanels.jsx');
  for (const type of PANEL_TYPES.filter(t => t !== 'explorer')) {
    if (!new RegExp(`['"]?${type}['"]?\\s*:\\s*function`).test(panelSource)) errors.push(`content panel missing: ${type}`);
  }
  // Follow actual source imports from main.jsx; ignore dormant historical entry points.
  async function visit(file) {
    if (graph.has(file) || !/\.[cm]?[jt]sx?$/.test(file)) return;
    const source = await read(file),
      edges = [];
    graph.set(file, edges);
    const imports = [...source.matchAll(/(?:import|export)\s+(?:[^;]*?\sfrom\s*)?['"]([^'"]+)['"]/g)].map(m => m[1]);
    for (const specifier of imports.filter(s => s.startsWith('.'))) {
      const base = path.normalize(path.join(path.dirname(file), specifier));
      const candidates = [base, ...['.js', '.jsx', '.mjs', '.json', '.css'].map(ext => base + ext)];
      let resolved;
      for (const c of candidates) if (await exists(c)) {
        resolved = c;
        break;
      }
      if (!resolved) {
        errors.push(`unresolved import: ${file} → ${specifier}`);
        continue;
      }
      edges.push(resolved);
      await visit(resolved);
    }
  }
  await visit('src/main.jsx');
  const visiting = new Set(),
    visited = new Set();
  function cycle(file, chain = []) {
    if (visiting.has(file)) {
      errors.push(`dependency cycle: ${[...chain, file].join(' → ')}`);
      return;
    }
    if (visited.has(file)) return;
    visiting.add(file);
    for (const edge of graph.get(file) || []) cycle(edge, [...chain, file]);
    visiting.delete(file);
    visited.add(file);
  }
  cycle('src/main.jsx');
  for (const [file, edges] of graph) {
    if (/scene-models|build-scenes/.test(file)) errors.push(`build-only geometry imported by browser: ${file}`);
    if (file.startsWith('src/spatial/core/')) for (const edge of edges) {
      if (/\/(ui|host|engine)\//.test(edge) || /\.jsx$/.test(edge)) errors.push(`core depends on UI/engine: ${file} → ${edge}`);
    }
    if (file === 'src/App.jsx' && edges.some(e => /scene-models|product-room-exhibits|craft\.js/.test(e))) errors.push('App must not construct models');
  }
  const forbidden = ['WorldScene.jsx', 'Discovery.jsx', 'Archive.jsx', 'ProductViewer.jsx', 'architecture.js', 'navigation.js', 'floor-layout.js', 'lift.js', 'space-config.js', 'models.js', 'exhibits.js', 'world-displays.js'];
  for (const file of forbidden) if (graph.has('src/' + file)) errors.push(`current application imports legacy implementation: src/${file}`);
  const manifest = await json('public/models/scenes/manifest.json');
  for (const [id, scene] of Object.entries(SCENES)) {
    if (!(await exists(`src/spatial/scene-models/${scene.model}.js`))) errors.push(`${id}: model factory missing`);
    const asset = 'public' + sceneResource(id);
    if (!(await exists(asset))) {
      errors.push(`${id}: GLB missing`);
      continue;
    }
    const entry = manifest.scenes.find(s => s.id === id);
    const buffer = await fs.readFile(path.join(root, asset));
    if (entry?.file !== scene.resource + '.glb' || entry?.bytes !== buffer.length) errors.push(`${id}: resource manifest out of date`);
    const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + buffer.readUInt32LE(12)));
    if (!gltf.nodes.some(n => n.extras?.sceneId === id && n.extras?.concept === true)) errors.push(`${id}: GLB identity or concept declaration missing`);
    for (const node of gltf.nodes) {
      const data = node.extras || {};
      if (data.action) errors.push(...contentLinkErrors(data.action, id, REGISTRY, products, concepts).map(e => `${id}/${node.name}: ${e}`));
      if (data.sign) errors.push(...untranslatedSign(data.sign).map(e => `${id}/${node.name}: missing translation ${e}`));
      if (data.productReference && !products.some(p => p.id === data.productReference.id)) errors.push(`${id}: product mount has no source ${data.productReference.id}`);
      if (data.sample && !concepts.some(p => p.id === data.sample.id)) errors.push(`${id}: sample mount has no concept ${data.sample.id}`);
    }
  }
  return {
    errors,
    scenes: Object.keys(SCENES).length,
    products: products.length,
    actionTypes: Object.keys(ACTIONS).length,
    panels: PANEL_TYPES.length,
    activeModules: graph.size,
    dependencies: Object.fromEntries(graph)
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await checkArchitecture();
  if (result.errors.length) {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  } else console.log(`Architecture OK: ${result.scenes} scenes, ${result.products} products, ${result.actionTypes} action types, ${result.panels} content panels; ${result.activeModules} active source modules; no dependency cycles.`);
}
