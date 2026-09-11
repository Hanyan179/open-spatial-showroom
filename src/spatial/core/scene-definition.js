/**
 * @typedef {Object} SceneDefinition
 * @property {string} id Stable route / content identity; never translated.
 * @property {string} floor Directory group, independent of floor number.
 * @property {string} model Build-only factory filename in scene-models/.
 * @property {string} resource GLB filename stem in public/models/scenes/.
 * @property {[string,string]} name Chinese and English display names.
 * @property {object} overview Safe camera pose.
 * @property {Array<object>} points Named camera poses, anchors and content actions.
 * @property {Array<object>} [areas] Physical areas referencing ordered point IDs.
 * @property {string[]} tour Ordered viewpoints; [] opts out of touring.
 * @property {object} navigation Building layout and safe corridor coordinates.
 * @property {string} region Geographic identity for cross-region transitions.
 * @property {boolean} [enabled] false keeps unfinished rooms out of all runtime lists.
 */
export const view = (position, look) => ({
  position,
  look
});
export const point = (id, name, anchor, camera, action, options = {}) => ({
  id,
  name,
  anchor,
  camera,
  action,
  ...options
});
export function viewpoints(scene) {
  return {
    overview: scene.overview,
    ...Object.fromEntries(scene.points.map(p => [p.id, p.camera])),
    ...scene.extraViews
  };
}
