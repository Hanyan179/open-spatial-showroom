import { SCENES } from './core/scene-registry.js';
import * as T from 'three';
import { createEarth } from './earth.js';
import { MARKETS } from './core/markets.js';
export const REGIONS = Object.values(SCENES).filter(s => s.journey).map(s => s.region);
const OVERSEAS = Object.values(SCENES).filter(s => s.region !== 'china').map(s => s.id);
export const transitionMode = (from, to) => from === to ? 'walk' : OVERSEAS.includes(from) || OVERSEAS.includes(to) ? 'flight' : 'lift';
export const flightRegion = scene => SCENES[scene]?.region || 'china';
export function globePoint(id) {
  const market = MARKETS.find(m => m.id === id) || MARKETS[0];
  const [lat, lon] = market.coordinate.map(T.MathUtils.degToRad);
  return new T.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
}
export function routePoint(from, to, t) {
  let a = globePoint(from),
    b = globePoint(to);
  if (a.distanceTo(b) < .01) a.applyAxisAngle(new T.Vector3(0, 1, 0), -.35);
  const height = Math.min(2.1, 12.55 * .14 * a.angleTo(b)),
    q = new T.Quaternion().setFromUnitVectors(a, b);
  return a.applyQuaternion(new T.Quaternion().slerp(q, t)).multiplyScalar(12.55 + height * Math.sin(Math.PI * t));
}
export function routePose(from, to, t) {
  const u = T.MathUtils.clamp(t, 0, 1),
    position = routePoint(from, to, u);
  // The aircraft's nose is local +Z. Build its frame in the globe's local space;
  // Object3D.lookAt takes a world target and cannot use these rotating local points.
  const forward = routePoint(from, to, Math.min(1, u + .0001)).sub(routePoint(from, to, Math.max(0, u - .0001))).normalize();
  const right = new T.Vector3().crossVectors(position.clone().normalize(), forward).normalize();
  const up = new T.Vector3().crossVectors(forward, right).normalize();
  return {
    position,
    quaternion: new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(right, up, forward))
  };
}
export function createGlobalFlight(environment) {
  const scene = new T.Scene();
  scene.background = new T.Color('#07182c');
  scene.environment = environment;
  const camera = new T.PerspectiveCamera(44, 2, .1, 180);
  camera.position.set(0, 1, 47);
  camera.lookAt(0, 0, 0);
  scene.add(new T.HemisphereLight('#e2f1ff', '#17324d', 2.2));
  const sun = new T.DirectionalLight('#ffeed4', 3);
  sun.position.set(-18, 20, 25);
  scene.add(sun);
  const earth = createEarth(scene);
  earth.group.position.set(0, -3, 0);
  earth.stars.position.y = -55;
  const route = new T.Group();
  earth.globe.add(route);
  let arc, progress;
  const jet = new T.Group(),
    white = new T.MeshStandardMaterial({
      color: '#f4f0df',
      metalness: .35,
      roughness: .3
    }),
    navy = new T.MeshStandardMaterial({
      color: '#17324d',
      metalness: .4,
      roughness: .27
    });
  const body = new T.Mesh(new T.CapsuleGeometry(.12, 1.5, 5, 16), white);
  body.rotation.x = Math.PI / 2;
  jet.add(body);
  const wings = new T.Shape();
  wings.moveTo(-.08, .35);
  wings.lineTo(-1.1, -.38);
  wings.lineTo(-1.08, -.56);
  wings.lineTo(0, -.24);
  wings.lineTo(1.08, -.56);
  wings.lineTo(1.1, -.38);
  wings.lineTo(.08, .35);
  wings.closePath();
  const wing = new T.Mesh(new T.ExtrudeGeometry(wings, {
    depth: .045,
    bevelEnabled: true,
    bevelSize: .02,
    bevelThickness: .015,
    bevelSegments: 2,
    steps: 1
  }), white);
  wing.rotation.x = Math.PI / 2;
  jet.add(wing);
  const tail = wing.clone();
  tail.scale.set(.38, .38, .6);
  tail.position.z = -.7;
  jet.add(tail);
  const fin = new T.Mesh(new T.BoxGeometry(.04, .42, .36), navy);
  fin.position.set(0, .22, -.67);
  jet.add(fin);
  for (const x of [-.43, .43]) {
    const engine = new T.Mesh(new T.CylinderGeometry(.09, .11, .42, 12), navy);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -.12, -.15);
    jet.add(engine);
  }
  const cockpit = new T.Mesh(new T.SphereGeometry(.105, 12, 8), navy);
  cockpit.scale.set(.82, .38, 1.5);
  cockpit.position.set(0, .075, .62);
  jet.add(cockpit);
  route.add(jet);
  let from = 'china',
    to = 'usa';
  const front = new T.Vector3(0, .04, 1).normalize();
  function start(origin, destination) {
    from = origin;
    to = destination;
    for (const old of [arc, progress]) if (old) {
      old.removeFromParent();
      old.geometry.dispose();
      old.material.dispose();
    }
    const points = Array.from({
        length: 97
      }, (_, i) => routePoint(from, to, i / 96)),
      curve = new T.CatmullRomCurve3(points);
    arc = new T.Mesh(new T.TubeGeometry(curve, 96, .027, 6, false), new T.MeshBasicMaterial({
      color: '#bfa984',
      transparent: true,
      opacity: .24
    }));
    progress = new T.Mesh(arc.geometry.clone(), new T.MeshBasicMaterial({
      color: '#ffdc98'
    }));
    route.add(arc, progress);
    update(0);
  }
  function update(t) {
    const u = T.MathUtils.clamp(t, 0, 1),
      e = u * u * (3 - 2 * u),
      pose = routePose(from, to, e),
      p = pose.position;
    earth.globe.quaternion.setFromUnitVectors(p.clone().normalize(), front);
    jet.position.copy(p);
    jet.quaternion.copy(pose.quaternion);
    jet.visible = u < .995;
    progress?.geometry.setDrawRange(0, Math.max(0, Math.floor(e * 96)) * 36);
    earth.markers.forEach(m => {
      m.dot.scale.setScalar(m.id === to ? 1.7 : 1);
      m.halo.scale.setScalar(m.id === to ? 1.6 : 1);
    });
    camera.position.z = 47 - 2 * Math.sin(Math.PI * u);
  }
  return {
    scene,
    camera,
    start,
    update,
    resize(w, h) {
      camera.aspect = w / h;
      camera.fov = w / h < 1.6 ? 48 : 44;
      camera.updateProjectionMatrix();
    },
    dispose() {
      earth.dispose();
      const geos = new Set(),
        mats = new Set();
      scene.traverse(o => {
        if (o.geometry) geos.add(o.geometry);
        for (const m of [].concat(o.material || [])) mats.add(m);
      });
      geos.forEach(g => g.dispose());
      mats.forEach(m => m.dispose());
    }
  };
}
