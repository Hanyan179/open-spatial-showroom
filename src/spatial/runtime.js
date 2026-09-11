import { installRoomFeatures } from './room-features.js';
import { sceneResource, SCENES } from './core/scene-registry.js';
import { signLines } from './sign-language.js';
import * as T from 'three';
import { createSurfaceLibrary } from './rendering/surface-library.js';
import { batchSample } from './sample-batch.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { loadConfiguration, webUrl } from './resource-client.js';
import { createProduct, updateProductLanguage } from '../../vendor/explorer/src/models.js';
export class SceneCache {
  constructor(load, dispose, max = 3) {
    this.load = load;
    this.dispose = dispose;
    this.max = max;
    this.entries = new Map();
    this.keep = new Set();
  }
  async get(id) {
    let entry = this.entries.get(id);
    if (!entry) {
      entry = {
        value: null
      };
      entry.promise = this.load(id).then(value => {
        entry.value = value;
        this.prune();
        return value;
      }).catch(error => {
        this.entries.delete(id);
        throw error;
      });
      this.entries.set(id, entry);
    }
    entry.used = Date.now();
    return entry.promise;
  }
  protect(ids) {
    this.keep = new Set(ids.filter(Boolean));
    this.prune();
  }
  prune() {
    for (const [id, e] of [...this.entries].sort((a, b) => (a[1].used || 0) - (b[1].used || 0))) {
      if (this.entries.size <= this.max) break;
      if (e.value && !this.keep.has(id)) {
        this.dispose(e.value);
        this.entries.delete(id);
      }
    }
  }
  clear() {
    for (const e of this.entries.values()) e.promise.then(v => this.dispose(v)).catch(() => {});
    this.entries.clear();
  }
}
export function disposeGroup(root) {
  root.disposeFeatures?.();
  root.disposeSurfaces?.();
  const geometry = new Set(),
    materials = new Set();
  root.removeFromParent();
  root.traverse(o => {
    if (o.isReflector) o.getRenderTarget().dispose();
    if (o.geometry) geometry.add(o.geometry);
    for (const m of [].concat(o.material || [])) materials.add(m);
  });
  geometry.forEach(g => g.dispose());
  materials.forEach(m => {
    if(!m.map?.userData.surfaceOwned)m.map?.dispose();
    m.dispose();
  });
}
// Secondary reflections omit refractive shells; their solid interiors remain visible.
// Three keeps a transmission target per reflection camera, so new room cameras
// must not allocate a fresh transmission target on every visit.
export function withoutRefractiveShells(scene, render) {
  const hidden = [];
  scene.traverse(o => {
    if (o.isMesh && o.visible && [].concat(o.material || []).some(m => m.transmission > 0)) {
      hidden.push(o);
      o.visible = false;
    }
  });
  try {
    return render();
  } finally {
    hidden.forEach(o => {
      o.visible = true;
    });
  }
}
export function signCanvasSize(w, h) {
  const width = Math.min(4096, Math.max(512, Math.round(w * 512)));
  return {
    width,
    height: Math.max(1, Math.round(width * h / w))
  };
}
function signTexture({
  text,
  w,
  h,
  colour = '#1c3448',
  background
}) {
  const c = document.createElement('canvas'),
    size = signCanvasSize(w, h);
  c.width = size.width;
  c.height = size.height;
  const ctx = c.getContext('2d');
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.fillStyle = colour;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = Array.isArray(text) ? text : [text],
    weights = lines.map((_, i) => i ? .68 : 1),
    unit = c.height * .8 / (weights.reduce((a, b) => a + b, 0) + (lines.length - 1) * .22);
  let y = c.height * .1;
  lines.forEach((line, i) => {
    let px = unit * weights[i];
    const font = n => `${i ? '400' : '500'} ${n}px "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif`;
    ctx.font = font(px);
    px *= Math.min(1, c.width * .93 / Math.max(1, ctx.measureText(line).width));
    ctx.font = font(px);
    ctx.fillText(line, c.width / 2, y + unit * weights[i] / 2);
    y += unit * (weights[i] + .22);
  });
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
export async function loadRoom(id) {
  const began = performance.now(),
    controller = new AbortController(),
    timeout = setTimeout(() => controller.abort(), 20000);
  let bytes;
  try {
    const response = await fetch(sceneResource(id), {
      signal: controller.signal,
      cache: 'no-cache'
    });
    if (!response.ok) throw Error(`Scene ${id}: HTTP ${response.status}`);
    bytes = await response.arrayBuffer();
  } finally {
    clearTimeout(timeout);
  }
  const gltf = await new GLTFLoader().parseAsync(bytes, '/models/scenes/'),
    root = gltf.scene,
    logos = [],
    samples = [],
    signs = [],
    mirrors = [];
  const surfaceLibrary = createSurfaceLibrary();
  root.disposeSurfaces = () => surfaceLibrary.dispose();
  root.traverse(o => {
    if (o.userData.mirrors) mirrors.push(o);
    if (o.userData.identity) logos.push(o);
    if (o.userData.sample) samples.push(o);
    if (o.userData.sign) signs.push(o);
    if (o.isMesh) {
      if (SCENES[id].lighting === 'night' && o.material.name === 'glass') {
        o.material.opacity = .035;
        o.material.color.set('#638aa5');
      }
      o.castShadow = o.material.name !== 'glass' && o.material.name !== 'light';
      o.receiveShadow = true;
      surfaceLibrary.apply(o.material);
    }
  });
  for (const mount of mirrors) {
    const data = mount.userData.mirrors,
      r = data.width / 2,
      h = data.height / 2,
      shape = new T.Shape();
    shape.moveTo(-r, -h);
    shape.lineTo(-r, h - r);
    shape.absarc(0, h - r, r, Math.PI, 0, true);
    shape.lineTo(r, -h);
    shape.closePath();
    const parts = data.centres.map(x => new T.ShapeGeometry(shape, 40).translate(x, 0, 0));
    const geo = mergeGeometries(parts);
    parts.forEach(g => g.dispose());
    const mirror = new Reflector(geo, {
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0xd8d9d4,
      clipBias: .003,
      multisample: 2
    });
    mirror.name = 'Arched planar mirror reflection';
    const reflect = mirror.onBeforeRender;
    mirror.onBeforeRender = (...args) => withoutRefractiveShells(args[1], () => reflect.apply(mirror, args));
    mount.add(mirror);
  }
  root.updateQuality = profile => {
    surfaceLibrary.setQuality(profile.anisotropy);
    root.traverse(o=>{if(o.isReflector){const rt=o.getRenderTarget();if(rt.width!==profile.reflection)rt.setSize(profile.reflection,profile.reflection);}for(const m of [].concat(o.material || [])){if(m.map && !m.map.userData.surfaceOwned && m.map.anisotropy!==profile.anisotropy){m.map.anisotropy=profile.anisotropy;m.map.needsUpdate=true;}}});
  };
  const config = await loadConfiguration();
  for (const mount of logos) {
    const w = mount.userData.identity.width || 3;
    if (config.identity?.logoUrl) {
      const url = webUrl(config.identity.logoUrl);
      if (!url) throw Error('Invalid identity image URL');
      const texture = await new T.TextureLoader().loadAsync(url);
      texture.colorSpace = T.SRGBColorSpace;
      const image = texture.image;
      const material = new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
      material.userData.ownMap = true;
      mount.add(new T.Mesh(new T.PlaneGeometry(w,w*image.height/image.width),material));
    } else {
      mount.userData.sign = {w,h:w*.2,text:[],i18n:{zh:[config.identity?.welcome?.zh || '欢迎探索'],en:[config.identity?.welcome?.en || 'WELCOME']},colour:mount.userData.identity.light?'#f4f2ed':'#1c3448'};
      signs.push(mount);
    }
  }
  const mappedSigns = [];
  for (const mount of signs) {
    const s = mount.userData.sign,
      m = new T.MeshBasicMaterial({
        map: signTexture(s),
        transparent: !s.background,
        depthWrite: false,
        toneMapped: false
      });
    m.userData.ownMap = true;
    const plane = new T.Mesh(new T.PlaneGeometry(s.w, s.h), m);
    plane.renderOrder = 2;
    mount.add(plane);
    mappedSigns.push({
      spec: s,
      material: m
    });
  }
  for (const mount of samples) {
    const {
        id: pid,
        height
      } = mount.userData.sample,
      p = batchSample(createProduct(pid)),
      bounds = new T.Box3().setFromObject(p),
      size = bounds.getSize(new T.Vector3());
    const scale = height / size.y;
    p.scale.setScalar(scale);
    p.position.y = -bounds.min.y * scale;
    mount.add(p);
    if (id === 'beauty' || id === 'usa') {
      const contact = new T.Mesh(new T.PlaneGeometry(size.x * scale * 1.15, size.z * scale * 1.2), new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        uniforms: {},
        vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'varying vec2 v;void main(){float r=length((v-.5)*2.);float a=exp(-r*r*5.)*(1.-smoothstep(.75,1.,r));gl_FragColor=vec4(.08,.13,.18,a*.23);}'
      }));
      contact.name = 'Soft contact beneath the concept sample';
      contact.rotation.x = -Math.PI / 2;
      contact.position.set((bounds.min.x + bounds.max.x) * scale / 2, -.008, (bounds.min.z + bounds.max.z) * scale / 2);
      mount.add(contact);
    }
    // Product movement belongs to an explicit powered mount, never a room-ID default.
    p.traverse(o => {
      if (o.isMesh) o.userData.action = {
        type: 'product',
        id: pid,
        domain: ['lipstick', 'serum', 'compact'].includes(pid) ? 'beauty' : ['rings', 'maraca', 'puzzle'].includes(pid) ? 'play' : 'party'
      };
    });
  }
  let language = null;
  root.updateLanguage = lang => {
    if (language === lang) return;
    language = lang;
    for (const {
      spec,
      material
    } of mappedSigns) {
      const old = material.map;
      material.map = signTexture({
        ...spec,
        text: signLines(spec, lang)
      });
      material.needsUpdate = true;
      old.dispose();
    }
    updateProductLanguage(root, lang);
    root.userData.signLanguage = lang;
    root.userData.signTexts = mappedSigns.map(({
      spec
    }) => signLines(spec, lang).join(' · '));
  };
  root.updateLanguage('zh');
  root.traverse(o => {
    if (o.userData.walkObstacles) root.walkObstacles = o.userData.walkObstacles;
  });
  installRoomFeatures(root);
  root.userData.loadMs = Math.round(performance.now() - began);
  root.updateMatrixWorld(true);
  return root;
}
export function createCabin(scene) {
  const group = new T.Group();
  group.position.set(6.7, 0, -8.14);
  scene.add(group);
  const stone = new T.MeshStandardMaterial({
      color: '#c5bdab',
      roughness: .66
    }),
    brass = new T.MeshStandardMaterial({
      color: '#ac9374',
      roughness: .32,
      metalness: .7
    }),
    navy = new T.MeshStandardMaterial({
      color: '#1c3448',
      roughness: .5
    }),
    light = new T.MeshBasicMaterial({
      color: '#f4e4c8'
    });
  const b = (size, p, m) => {
    const mesh = new T.Mesh(new T.BoxGeometry(...size), m);
    mesh.position.set(...p);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  b([2.4, .1, 2.9], [0, -.05, 0], stone);
  b([2.4, .12, 2.9], [0, 3.04, 0], navy);
  b([1.9, .012, 2.2], [0, 2.97, 0], light);
  b([2.4, 3, .08], [0, 1.5, -1.45], navy);
  for (const x of [-1.24, 1.24]) {
    b([.08, 3, 2.9], [x, 1.5, 0], brass);
    b([.04, .045, 2.2], [x * .96, 1.05, 0], navy);
  }
  const doors = [b([1.2, 3.03, .07], [-.6, 1.51, 1.44], brass), b([1.2, 3.03, .07], [.6, 1.51, 1.44], brass)];
  let opening = 1;
  const signMat = new T.MeshBasicMaterial({
    map: signTexture({
      text: ['01', 'SHOWROOM'],
      w: .6,
      h: .45,
      colour: '#e9d9b9',
      background: '#1c3448'
    })
  });
  signMat.userData.ownMap = true;
  const indicator = new T.Mesh(new T.PlaneGeometry(.6, .45), signMat);
  indicator.position.set(.6, 2, -1.397);
  group.add(indicator);
  return {
    group,
    setFloor(n) {
      const old = signMat.map;
      signMat.map = signTexture({
        text: [String(n).padStart(2, '0'), 'SHOWROOM'],
        w: .6,
        h: .45,
        colour: '#e9d9b9',
        background: '#1c3448'
      });
      signMat.needsUpdate = true;
      old.dispose();
    },
    update(open, dt) {
      opening = T.MathUtils.damp(opening, open ? 1 : 0, 6, dt);
      doors[0].position.x = -.6 - opening * 1.25;
      doors[1].position.x = .6 + opening * 1.25;
    },
    dispose() {
      disposeGroup(group);
    }
  };
}
