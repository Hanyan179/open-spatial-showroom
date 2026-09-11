// Areas name the physical stops; navigation, local guides and touring share point IDs.
export function sceneAreas(scene) {
  const order = [...new Set([...(scene.tour || []), ...scene.points.map(p => p.id)])];
  return scene.areas || order.map(id => scene.points.find(p => p.id === id)).filter(Boolean).map(p => ({ id: p.id, name: p.name, points: [p.id] }));
}
export function areaAt(scene, point) {
  return sceneAreas(scene).find(a => a.points.includes(point.replace(/-opposite$/, '')));
}
export function orderedStops(scene) {
  return sceneAreas(scene).flatMap(a => a.points.map(id => scene.points.find(p => p.id === id)));
}
// Projection/occlusion is measured by the renderer, selection is pure and bounded.
export function visiblePins(candidates, limit = 3) {
  const chosen = [];
  for (const pin of candidates.filter(p => p.visible).sort((a, b) => a.distance - b.distance)) {
    if (chosen.some(p => Math.abs(p.x - pin.x) < .25 && Math.abs(p.y - pin.y) < .3)) continue;
    chosen.push(pin);
    if (chosen.length === limit) break;
  }
  return new Set(chosen.map(p => p.id));
}

export const sceneTone = (scene, point) => scene.points.find(p => p.id === point)?.tone || scene.tone;
