import { TOUR, TOUR_POINTS, SCENES } from './scene-registry.js';

// Presenter keys travel along the same registered route as the automatic tour.
export function presenterDestination(scene, point, direction) {
  const route = TOUR.flatMap(id => TOUR_POINTS[id].map(at => ({ scene: id, point: at })));
  let index = route.findIndex(stop => stop.scene === scene && stop.point === point);
  if (index < 0) index = route.findIndex(stop => stop.scene === scene);
  return route[(Math.max(0, index) + direction + route.length) % route.length];
}

export function presenterKey(key, { editing = false, interactive = false, overlay = false, moving = false, repeat = false, modified = false, ready = true } = {}) {
  if (!ready || editing || overlay || repeat || modified) return null;
  // Page keys remain usable after a presenter clicks a button. Native button,
  // input, media, and dialog keyboard behavior always keeps its own Enter/Space.
  if (!moving && key === 'PageDown') return 'next';
  if (!moving && key === 'PageUp') return 'previous';
  if (key === 'Escape') return 'back';
  if (key.toLowerCase() === 'm') return 'menu';
  if (key.toLowerCase() === 'p') return 'play';
  if (interactive) return null;
  if (key === ' ') return 'play';
  if (moving) return null;
  return { ArrowRight: 'next', ArrowLeft: 'previous', Enter: 'open' }[key] || null;
}

export function presenterPoint(scene, point) {
  return SCENES[scene]?.points.find(p => p.id === point);
}
