import { SCENES } from './core/scene-registry.js';
// Build-time only. Room factories never enter the browser application bundle.
export async function buildScene(id) {
  const scene = SCENES[id];
  if (!scene) throw Error(`Unknown scene: ${id}`);
  const {
    default: build
  } = await import(`./scene-models/${scene.model}.js`);
  return build(id);
}
