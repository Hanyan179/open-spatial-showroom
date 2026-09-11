import { SCENES, sceneView, LIFT } from './catalog.js';
const isRegional = id => SCENES[id]?.navigation.layout === 'promenade';
export function roomPath(scene, from, to) {
  if (isRegional(scene)) return [from.position, [0, 1.85, from.position[2]], [0, 1.85, to.position[2]], to.position];
  const points = [from.position];
  // All curated walks use the clear circulation strip in front of the exhibits.
  if (from.position[2] < 1.8 && to.position[2] < 1.8 && Math.abs(from.position[0] - to.position[0]) > 1.2) points.push([from.position[0], 1.78, 2.2], [to.position[0], 1.78, 2.2]);else if (Math.abs(from.position[0] - to.position[0]) > 3 && Math.min(from.position[2], to.position[2]) < 0) points.push([from.position[0], 1.78, 3.2], [to.position[0], 1.78, 3.2]);
  points.push(to.position);
  return points;
}
// Keep a full metre of clear camera space beside cabinets and lounge seating.
export const CAMERA_CLEARANCE = .5;
export function segmentClear(a, b, obstacles, padding = CAMERA_CLEARANCE + .035) {
  // Slab intersection against inflated furniture footprints. Includes the whole segment.
  return !obstacles.some(([x0, z0, x1, z1]) => {
    let lo = 0,
      hi = 1;
    for (const [axis, min, max] of [[0, x0 - padding, x1 + padding], [2, z0 - padding, z1 + padding]]) {
      const d = b[axis] - a[axis];
      if (Math.abs(d) < 1e-8) {
        if (a[axis] < min || a[axis] > max) return false;
      } else {
        const u = (min - a[axis]) / d,
          v = (max - a[axis]) / d;
        lo = Math.max(lo, Math.min(u, v));
        hi = Math.min(hi, Math.max(u, v));
        if (lo > hi) return false;
      }
    }
    return true;
  });
}
export function planWalk(points, obstacles = []) {
  const clean = points.filter((p, i) => !i || Math.hypot(...p.map((v, k) => v - points[i - 1][k])) > .015);
  if (clean.length < 2) return clean;
  // Take the furthest visible waypoint; retain the safe aisle when furniture intervenes.
  const route = [clean[0]];
  let at = 0;
  while (at < clean.length - 1) {
    let next = clean.length - 1;
    while (next > at + 1 && !segmentClear(clean[at], clean[next], obstacles)) next--;
    route.push(clean[next]);
    at = next;
  }
  for (const radius of [1.05, .7, .35, 0]) {
    const rounded = roundedPath(route, radius);
    if (rounded.slice(1).every((p, i) => segmentClear(rounded[i], p, obstacles))) return rounded;
  }
  return roundedPath(clean, .48);
}
// Cruise at a steady pace between brief cosine acceleration / braking ramps.
export function travelProgress(u, ramp = .2) {
  const r = Math.max(.03, Math.min(.45, ramp)),
    t = Math.max(0, Math.min(1, u));
  if (t < r) return (t / 2 - r * Math.sin(Math.PI * t / r) / (2 * Math.PI)) / (1 - r);
  if (t > 1 - r) return 1 - travelProgress(1 - t, r);
  return (t - r / 2) / (1 - r);
}
export const corridorX = scene => SCENES[scene].navigation.corridorX;
export function liftPath(from, scene) {
  const x = corridorX(scene);
  if (isRegional(scene)) return [from.position, [0, 1.85, from.position[2]], [0, 1.78, -5.55], [6.7, 1.72, -5.55], LIFT.entry, LIFT.inside];
  return [from.position, [from.position[0], 1.78, 6.2], [x, 1.78, 6.2], [x, 1.72, -5.25], [6.7, 1.72, -5.25], LIFT.entry, LIFT.inside];
}
export function exitPath(to, scene) {
  if (isRegional(scene)) return [LIFT.inside, LIFT.entry, [6.7, 1.72, -5.55], [0, 1.78, -5.55], [0, to.position[1], to.position[2]], to.position];
  const x = corridorX(scene);
  return [LIFT.inside, LIFT.entry, [6.7, 1.75, -5.25], [x, 1.78, -5.25], [x, 1.78, 6.2], [to.position[0], to.position[1], Math.max(6.2, to.position[2])], to.position];
}
export function routeValid(target) {
  return Boolean(SCENES[target.scene] && (target.point === 'overview' || SCENES[target.scene].points.some(p => p.id === target.point) || SCENES[target.scene].extraViews?.[target.point]));
}
// Round each turn inside its control polygon, avoiding spline overshoot into walls.
export function roundedPath(points, radius = .48) {
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i],
      c = points[i + 1],
      ab = Math.hypot(...a.map((v, j) => v - b[j])),
      bc = Math.hypot(...c.map((v, j) => v - b[j]));
    if (ab < .001 || bc < .001) continue;
    const r = Math.min(radius, ab * .3, bc * .3),
      before = b.map((v, j) => v + (a[j] - v) * r / ab),
      after = b.map((v, j) => v + (c[j] - v) * r / bc);
    out.push(before);
    for (let k = 1; k <= 8; k++) {
      const u = k / 8;
      out.push(b.map((v, j) => (1 - u) ** 2 * before[j] + 2 * (1 - u) * u * v + u * u * after[j]));
    }
  }
  out.push(points.at(-1));
  return out;
}
export function pathSampler(points) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(...points[i].map((v, j) => v - points[i - 1][j])));
  const length = lengths.at(-1);
  return {
    length,
    at(t) {
      if (length < .0001) return points.at(-1);
      const d = Math.max(0, Math.min(1, t)) * length;
      let i = 1;
      while (i < lengths.length - 1 && lengths[i] < d) i++;
      const span = lengths[i] - lengths[i - 1],
        u = span ? (d - lengths[i - 1]) / span : 0;
      return points[i].map((v, j) => points[i - 1][j] + (v - points[i - 1][j]) * u);
    }
  };
}
