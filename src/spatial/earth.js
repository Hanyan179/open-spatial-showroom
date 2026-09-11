import * as T from 'three';
import { MARKETS } from './core/markets.js';
import { createStarfield } from './starfield.js';
export function facingRegionQuaternion([latitude, longitude]) {
  const yaw = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), -Math.PI / 2 - T.MathUtils.degToRad(longitude));
  return new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), T.MathUtils.degToRad(latitude) - .05).multiply(yaw);
}
export function createEarth(scene) {
  const group = new T.Group();
  group.position.set(0, 55.8, -21);
  scene.add(group);
  const globe = new T.Group();
  group.add(globe);
  let alive = true;
  const earth = new T.Mesh(new T.SphereGeometry(12, 96, 64), new T.MeshStandardMaterial({
    color: '#174c68',
    metalness: .22,
    roughness: .58,
    emissive: '#0a223b',
    emissiveIntensity: .25
  }));
  globe.add(earth);
  fetch('/data/geo/land.geojson').then(r => {
    if (!r.ok) throw Error();
    return r.json();
  }).then(geo => {
    if (!alive) return;
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const c = canvas.getContext('2d');
    c.scale(2, 2);
    c.fillStyle = '#10364e';
    c.fillRect(0, 0, 2048, 1024);
    c.fillStyle = '#799793';
    c.strokeStyle = '#acbaa5';
    c.lineWidth = 1;
    for (const f of geo.features) {
      const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polygons) {
        c.beginPath();
        for (const ring of poly) {
          ring.forEach(([lon, lat], i) => {
            const x = (lon + 180) / 360 * 2048,
              y = (90 - lat) / 180 * 1024;
            i ? c.lineTo(x, y) : c.moveTo(x, y);
          });
          c.closePath();
        }
        c.fill('evenodd');
        c.stroke();
      }
    }
    c.strokeStyle = 'rgba(196,217,222,.16)';
    c.lineWidth = 1;
    for (let x = 0; x < 2048; x += 2048 / 24) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, 1024);
      c.stroke();
    }
    for (let y = 0; y < 1024; y += 1024 / 12) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(2048, y);
      c.stroke();
    }
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    earth.material.envMapIntensity = .35;
    earth.material.map = tex;
    earth.material.color.set('white');
    earth.material.needsUpdate = true;
  }).catch(() => {
    earth.userData.geographyUnavailable = true;
  });
  const air = new T.Mesh(new T.SphereGeometry(12.24, 64, 48), new T.ShaderMaterial({
    transparent: true,
    side: T.BackSide,
    depthWrite: false,
    uniforms: {},
    vertexShader: 'varying vec3 n; varying vec3 v; void main(){ vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
    fragmentShader: 'varying vec3 n; varying vec3 v; void main(){float a=pow(1.-abs(dot(n,v)),3.); gl_FragColor=vec4(.24,.62,.85,a*.55);}'
  }));
  globe.add(air);
  const coord = (lat, lon, r = 12.1) => new T.Vector3(r * Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180), r * Math.sin(lat * Math.PI / 180), -r * Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180));
  const markers = MARKETS.map(m => {
    const dot = new T.Mesh(new T.SphereGeometry(.16, 16, 12), new T.MeshBasicMaterial({
      color: '#ffd39a',
      toneMapped: false
    }));
    dot.position.copy(coord(...m.coordinate));
    dot.userData.action = {
      type: 'market',
      id: m.id
    };
    globe.add(dot);
    const halo = new T.Mesh(new T.TorusGeometry(.3, .025, 8, 40), new T.MeshBasicMaterial({
      color: '#ffd39a'
    }));
    halo.position.copy(dot.position);
    halo.lookAt(dot.position.clone().multiplyScalar(2));
    globe.add(halo);
    return {
      id: m.id,
      dot,
      halo
    };
  });
  const sky = createStarfield(scene);
  const points = sky.group;
  let selected = '',
    target = new T.Quaternion(),
    elapsed = 0;
  const base = new T.Quaternion(),
    offset = new T.Quaternion(),
    up = new T.Vector3(0, 1, 0);
  return {
    group,
    globe,
    stars: points,
    markers,
    sky,
    update(id, dt, {
      reducedMotion = false
    } = {}) {
      if (!reducedMotion) elapsed += Math.min(dt, .05);
      sky.update(dt, {
        reducedMotion
      });
      if (id !== selected) {
        selected = id;
        const m = MARKETS.find(m => m.id === id) || MARKETS[0];
        target.copy(facingRegionQuaternion(m.coordinate));
      }
      base.slerp(target, Math.min(dt * 1.8, 1));
      offset.setFromAxisAngle(up, reducedMotion ? 0 : Math.sin(elapsed * .075) * .035);
      globe.quaternion.copy(base).multiply(offset);
      markers.forEach(m => {
        m.dot.scale.setScalar(m.id === selected ? 1.6 : 1);
        m.halo.scale.setScalar(m.id === selected ? 1.4 + (reducedMotion ? 0 : Math.sin(elapsed * .8) * .09) : 1);
      });
    },
    dispose() {
      alive = false;
      earth.material.map?.dispose();
    }
  };
}
