import * as T from 'three';
import { qualityProfile, drawingSize } from '../core/render-quality.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SCENES, TOUR, LIFT, STATE_VERSION, sceneView, restoredView, floorOf } from '../catalog';
import { SceneCache, loadRoom, disposeGroup, createCabin } from '../runtime';
import { roomPath, liftPath, exitPath, planWalk, pathSampler, travelProgress } from '../paths';
import { createEarth } from '../earth.js';
import { createGlobalFlight, transitionMode, flightRegion } from '../global-flight';
import { nextScene } from '../core/scene-registry.js';
import { visiblePins } from '../core/areas.js';
const isRegional = id => SCENES[id]?.navigation.layout === 'promenade';
export function createSpatialEngine(el, {
  getState,
  positions,
  setError,
  setFlightInfo
}) {
  const target = getState().target;
  let quality = qualityProfile(getState().quality);
  let lastStats = null;
  const publishStats = extra => { lastStats={...lastStats,...extra};getState().onStats?.(lastStats); };
  let renderer;
  try {
    renderer = new T.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    setError('graphics');
    getState().onError?.(e);
    return {
      dispose() {}
    };
  }
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  el.appendChild(renderer.domElement);
  const world = new T.Scene(),
    cam = new T.PerspectiveCamera(46, 1, .09, 150);
  world.background = new T.Color('#d6dedb');
  world.fog = new T.Fog('#d6dedb', 30, 95);
  const env = new RoomEnvironment(),
    pmrem = new T.PMREMGenerator(renderer),
    envMap = pmrem.fromScene(env, .035);
  world.environment = envMap.texture;
  world.environmentIntensity = .6;
  env.dispose();
  const hemi = new T.HemisphereLight('#fff0d5', '#9ca9a2', 1.2);
  world.add(hemi);
  const key = new T.DirectionalLight('#ffedcb', 3.1);
  key.position.set(-12, 11, 7);
  key.target.position.set(0, 0, -2);
  key.castShadow = true;
  key.shadow.autoUpdate = false;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -16,
    right: 16,
    top: 15,
    bottom: -15,
    near: .5,
    far: 45
  });
  key.shadow.bias = -.00008;
  key.shadow.normalBias = .025;
  world.add(key, key.target);
  const fill = new T.DirectionalLight('#d8e8e6', .9);
  fill.position.set(8, 4, 9);
  world.add(fill);
  const indoor = new T.PointLight('#ffe9cf', 38, 17, 2);
  indoor.position.set(0, 4.3, -2.8);
  world.add(indoor);
  const galleryLights = [];
  for (const [i, z] of [2, -10, -22].entries()) for (const side of [-1, 1]) {
    const bayZ = z + (i === 1 && side === 1 ? -3.3 : 0),
      spot = new T.SpotLight(side < 0 ? '#fff0d9' : '#dceaf0', 110, 15, .71, .48, 2);
    spot.position.set(side * 1.3, 4.8, bayZ + 2);
    spot.target.position.set(side * 5.8, .7, bayZ);
    spot.castShadow = true;
    spot.shadow.autoUpdate = false;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -.00015;
    spot.shadow.normalBias = .025;
    spot.visible = false;
    world.add(spot, spot.target);
    galleryLights.push(spot);
  }
  const cabin = createCabin(world),
    cabinLight = new T.PointLight('#fff0d8', 18, 5, 2);
  cabinLight.position.set(6.7, 2.75, -8.1);
  world.add(cabinLight);
  const earth = createEarth(world);
  earth.group.userData.action = {
    type: 'regions'
  };
  earth.group.position.set(-1.2, 4.1, -24);
  earth.group.scale.setScalar(.43);
  earth.stars.position.y = -50;
  let alive = true,
    current = null,
    previous = null,
    active = null,
    motion = null,
    pending = null,
    raf,
    then = 0,
    drawThen = 0,
    pinThen = 0,
    shadowThen = 0,
    dirty = true,
    stage = 'loading',
    doorOpen = true,
    generation = 0,
    drag = null,
    lastRequest = null,
    lastFloor = null,
    lastPoint = target.point || 'overview',
    frameCount = 0,
    fpsStart = performance.now();
  const flight = createGlobalFlight(envMap.texture);
  let flightMotion = null,
    shadowBank = -1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const preferenceChanged = () => {
    dirty = true;
    key.shadow.needsUpdate = true;
    galleryLights.forEach(light => {
      light.shadow.needsUpdate = true;
    });
    renderer.shadowMap.needsUpdate = true;
  };
  reducedMotion.addEventListener('change', preferenceChanged);
  const cache = new SceneCache(loadRoom, disposeGroup, 3),
    ray = new T.Raycaster(),
    mouse = new T.Vector2(),
    angles = new T.Euler(0, 0, 0, 'YXZ');
  const setStage = s => {
    stage = s;
    el.dataset.travel = s;
    getState().onStage?.(s);
    dirty = true;
  };
  const snapshot = () => ({
    position: cam.position.toArray(),
    quaternion: cam.quaternion.toArray(),
    look: cam.position.clone().add(cam.getWorldDirection(new T.Vector3()).multiplyScalar(6)).toArray()
  });
  const save = () => {
    if (current && stage === 'idle') {
      positions[current + '/' + lastPoint] = {
        ...snapshot(),
        point: lastPoint
      };
      try {
        sessionStorage.setItem(STATE_VERSION + '-positions', JSON.stringify(positions));
      } catch {}
    }
  };
  function setCamera(v) {
    cam.position.set(...v.position);
    if (v.quaternion) cam.quaternion.fromArray(v.quaternion);else cam.lookAt(...v.look);
    dirty = true;
  }
  function roomLighting(id) {
    shadowBank = -1;
    const night = SCENES[id].lighting === 'night',
      regional = isRegional(id);
    world.background.set(night ? '#061525' : '#d6dedb');
    world.fog.color.copy(world.background);
    world.fog.near = regional ? 45 : 30;
    world.fog.far = regional ? 110 : 95;
    hemi.intensity = night ? .65 : regional ? .85 : .92;
    key.intensity = night ? .55 : regional ? 2.85 : 2.65;
    fill.intensity = night ? .4 : regional ? 1 : .75;
    renderer.toneMappingExposure = night ? 1.08 : regional ? .98 : 1.02;
    key.position.set(-12, regional ? 17 : 11, regional ? 3 : 7);
    key.target.position.set(0, 0, regional ? -11 : -2);
    Object.assign(key.shadow.camera, regional ? {
      left: -23,
      right: 23,
      top: 29,
      bottom: -29,
      near: .5,
      far: 80
    } : {
      left: -16,
      right: 16,
      top: 15,
      bottom: -15,
      near: .5,
      far: 45
    });
    key.shadow.camera.updateProjectionMatrix();
    const shadowSize = Math.min(renderer.capabilities.maxTextureSize, regional ? quality.regionalShadow : quality.shadow);
    if (key.shadow.mapSize.x !== shadowSize) {
      key.shadow.map?.dispose();
      key.shadow.map = null;
      key.shadow.mapSize.set(shadowSize, shadowSize);
    }
    fill.position.set(8, 4, regional ? -16 : 9);
    indoor.position.set(0, 4.3, regional ? -11 : -2.8);
    galleryLights.forEach(light => {
      light.visible = regional;
    });
    earth.group.visible = night;
    earth.stars.visible = night;
    key.shadow.needsUpdate = true;
    galleryLights.forEach(light => {
      light.shadow.needsUpdate = true;
    });
    renderer.shadowMap.needsUpdate = true;
  }
  function attach(id, room) {
    active?.companyMedia?.pause();
    if (active) world.remove(active);
    previous = current;
    current = id;
    active = room;
    room.traverse(o => {
      if (!o.userData.inspect) return;
      const angle = positions._exhibitRotations?.[id + '/' + o.userData.inspect];
      if (Number.isFinite(angle)) o.rotation.y = angle;
    });
    room.updateLanguage(getState().lang);
    room.updateQuality(quality);
    world.add(room);
    el.dataset.scene = id;
    el.dataset.loadMs = String(room.userData.loadMs || 0);
    el.dataset.floor = String(floorOf(id).number);
    cabin.setFloor(floorOf(id).number);
    roomLighting(id);
    dirty = true;
  }
  const lookQ = look => {
    const matrix = new T.Matrix4().lookAt(cam.position, new T.Vector3(...look), new T.Vector3(0, 1, 0));
    return new T.Quaternion().setFromRotationMatrix(matrix);
  };
  function animate(points, view, done) {
    const sampled = pathSampler(planWalk(points, active?.walkObstacles || [])),
      distance = sampled.length;
    if (distance < .025) {
      motion = {
        rotationOnly: true,
        start: performance.now(),
        duration: 1650,
        fromQ: cam.quaternion.clone(),
        toQ: view.quaternion ? new T.Quaternion().fromArray(view.quaternion) : lookQ(view.look),
        view,
        done
      };
    } else {
      const speed = getState().target.touring ? 2.6 : 3.3,
        duration = Math.max(1300, (distance / speed + .85) * 1000);
      motion = {
        curve: sampled,
        start: performance.now(),
        duration,
        ramp: Math.min(.3, 850 / duration),
        view,
        done
      };
    }
    el.dataset.walkMetres = distance.toFixed(2);
    setStage('moving');
  }
  function complete(t) {
    lastPoint = t.point || 'overview';
    setStage('idle');
    save();
    getState().onArrival?.(t);
    lastRequest = t;
    const next = nextScene(current);
    cache.protect([current, previous, next]);
    cache.get(next).catch(() => {});
    if (pending) {
      const p = pending;
      pending = null;
      request(p);
    }
  }
  async function request(t) {
    if (!alive) return;
    if (stage !== 'idle' && stage !== 'error') {
      pending = t;
      return;
    }
    if (!SCENES[t.scene]) return;
    setError(null);
    save();
    const destination = t.restore ? restoredView(positions, t.scene, t.point) : sceneView(t.scene, t.point);
    if (current === t.scene) {
      animate(roomPath(current, snapshot(), destination), destination, () => complete(t));
      return;
    }
    const retryInCabin = stage === 'error' && Boolean(current);
    const requestGeneration = ++generation;
    cache.protect([current, previous, t.scene]);
    let loadFailure;
    const loading = cache.get(t.scene).catch(e => {
      loadFailure = e;
      return null;
    });
    if (transitionMode(current, t.scene) === 'flight') {
      const origin = snapshot();
      flight.start(flightRegion(current), flightRegion(t.scene));
      flightMotion = {
        start: performance.now(),
        duration: 5200,
        t,
        destination,
        origin,
        room: null,
        failed: false,
        finishAt: null,
        swapped: false
      };
      const ride = flightMotion;
      setFlightInfo({
        from: current,
        to: t.scene
      });
      setStage('flight');
      loading.then(room => {
        if (!alive || requestGeneration !== generation || flightMotion !== ride) return;
        ride.room = room;
        ride.failed = !room;
      });
      return;
    }
    const beginRide = () => {
      setStage('closing');
      doorOpen = false;
      const started = performance.now();
      const awaitDoor = async () => {
        await new Promise(r => setTimeout(r, 900));
        if (!alive || requestGeneration !== generation) return;
        setStage('loading');
        const room = await loading;
        if (!alive || requestGeneration !== generation) return;
        if (!room) {
          setError('load');
          setStage('error');
          getState().onError?.(loadFailure);
          return;
        }
        await new Promise(r => setTimeout(r, Math.max(0, 1650 - (performance.now() - started))));
        if (!alive || requestGeneration !== generation) return;
        attach(t.scene, room);
        doorOpen = true;
        setStage('opening');
        await new Promise(r => setTimeout(r, 850));
        if (!alive) return;
        animate(exitPath(destination, t.scene), destination, () => complete(t));
      };
      awaitDoor();
    };
    if (retryInCabin) beginRide();else animate(liftPath(snapshot(), current), {
      position: LIFT.inside,
      look: [6.7, 1.75, -5]
    }, beginRide);
  }
  const controls = {
    request,
    save,
    retry() {
      setError(null);
      if (!current) {
        setStage('loading');
        cache.get(getState().target.scene).then(room => {
          if (!alive) return;
          attach(getState().target.scene, room);
          setCamera(sceneView(current, getState().target.point));
          getState().onReady?.();
          complete(getState().target);
        }).catch(e => {
          setError('load');
          setStage('error');
          getState().onError?.(e);
        });
      } else {
        request(getState().target);
      }
    },
    returnToRoom() {
      if (flightMotion && current) {
        const origin = flightMotion.origin;
        flightMotion = null;
        el.dataset.flightPhase = 'idle';
        pending = null;
        generation++;
        setFlightInfo(null);
        el.style.setProperty('--travel-veil', '0');
        setCamera(origin);
        setError(null);
        getState().onRecover?.(current);
        complete({
          scene: current,
          point: lastPoint,
          request: Date.now()
        });
        return;
      }
      if (!current) {
        location.hash = '#/lobby';
        location.reload();
        return;
      }
      generation++;
      pending = null;
      doorOpen = true;
      setError(null);
      getState().onRecover?.(current);
      animate(exitPath(SCENES[current].overview, current), SCENES[current].overview, () => complete({
        scene: current,
        point: 'overview',
        request: Date.now()
      }));
    }
  };
  const resize = () => {
    const w = el.clientWidth,
      h = el.clientHeight;
    if (!w || !h) return;
    const {ratio} = drawingSize(w,h,devicePixelRatio,quality.id,renderer.capabilities.maxTextureSize);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h);
    cam.aspect = w / h;
    cam.fov = w / h < 1.6 ? 50 : 46;
    cam.updateProjectionMatrix();
    flight.resize(w, h);
    el.dataset.renderWidth = String(renderer.domElement.width);
    el.dataset.renderHeight = String(renderer.domElement.height);
    el.dataset.quality = quality.id;
    publishStats({quality:quality.id,width:renderer.domElement.width,height:renderer.domElement.height,viewportWidth:w,viewportHeight:h,shadow:quality.shadow,reflection:quality.reflection,paused:Boolean(getState().paused)});
    dirty = true;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(el);
  resize();
  const initial = target;
  cache.protect([initial.scene]);
  cache.get(initial.scene).then(room => {
    if (!alive) return;
    attach(initial.scene, room);
    setCamera(restoredView(positions, initial.scene, initial.point));
    setStage('idle');
    getState().onReady?.();
    complete(initial);
  }).catch(e => {
    if (alive) {
      setError('load');
      setStage('error');
      getState().onError?.(e);
    }
  });
  const down = e => {
    if (getState().paused || stage !== 'idle') return;
    angles.setFromQuaternion(cam.quaternion, 'YXZ');
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      yaw: angles.y,
      pitch: angles.x,
      moved: false
    };
    const rect = el.getBoundingClientRect();
    mouse.set((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2);
    ray.setFromCamera(mouse, cam);
    const hit = ray.intersectObject(active, true).find(h => !h.object.material?.transparent);
    let object = hit?.object;
    while (object && !object.userData.inspect) object = object.parent;
    if (object?.userData.inspect === lastPoint) {
      drag.exhibit = object;
      drag.angle = object.rotation.y;
    }
    el.setPointerCapture(e.pointerId);
  };
  const move = e => {
    if (!drag || drag.id !== e.pointerId) return;
    const x = e.clientX - drag.x,
      y = e.clientY - drag.y;
    if (Math.hypot(x, y) > 8) drag.moved = true;
    if (!drag.moved) return;
    if (drag.exhibit) {
      drag.exhibit.rotation.y = drag.angle + x / el.clientWidth * Math.PI * 3;
      positions._exhibitRotations ||= {};
      positions._exhibitRotations[current + '/' + lastPoint] = drag.exhibit.rotation.y;
      el.dataset.inspectedPoint = lastPoint;
      el.dataset.exhibitAngle = drag.exhibit.rotation.y.toFixed(3);
      renderer.shadowMap.needsUpdate = true;
      key.shadow.needsUpdate = true;
      dirty = true;
      return;
    }
    angles.set(T.MathUtils.clamp(drag.pitch - y / el.clientHeight * 1.4, -.6, .6), drag.yaw - x / el.clientWidth * 2.2, 0, 'YXZ');
    cam.quaternion.setFromEuler(angles);
    dirty = true;
  };
  const up = e => {
    if (!drag) return;
    const d = drag;
    drag = null;
    save();
    if (d.moved || getState().paused) return;
    const rect = el.getBoundingClientRect();
    mouse.set((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2);
    ray.setFromCamera(mouse, cam);
    const hits = ray.intersectObjects(current === 'office' ? [active, earth.group] : [active], true).filter(i => i.object.material?.name !== 'glass' && i.object.material?.side !== T.BackSide);
    let action;
    for (const h of hits) {
      let object = h.object;
      while (object) {
        if (object.userData.action) {
          action = object.userData.action;
          break;
        }
        object = object.parent;
      }
      if (action || h.object.isMesh) break;
    }
    if (action) getState().onAction?.(action);
  };
  const cancel = () => {
    drag = null;
    save();
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  window.addEventListener('blur', cancel);
  function projectPins() {
    const nodes = [...document.querySelectorAll('[data-spatial-pin]')];
    const candidates = [];
    const reserved = [...document.querySelectorAll('.world-header,.room-guide,.system-dock,.journey-story,.journey-chapters')].map(n => n.getBoundingClientRect()).filter(r => r.width && r.height);
    for (const pin of nodes) {
      const spec = SCENES[current]?.points.find(p => p.id === pin.dataset.spatialPin);
      let visible = Boolean(spec) && stage === 'idle' && !getState().paused && pin.dataset.focused !== 'true';
      let distance = Infinity, projection;
      if (visible) {
        const position = new T.Vector3(...spec.anchor);
        projection = position.clone().project(cam);
        distance = position.distanceTo(cam.position);
        visible = (!isRegional(current) || position.distanceTo(cam.position) < 12) && projection.z < 1 && projection.z > 0 && Math.abs(projection.x) < .9 && projection.y > -.55 && projection.y < .75;
        if (visible) {
          const direction = position.clone().sub(cam.position);
          const distance = direction.length();
          ray.set(cam.position, direction.normalize());
          ray.far = distance - .85;
          const obstruction = ray.intersectObject(active, true).find(h => !h.object.material?.transparent);
          visible = !obstruction;
          ray.far = Infinity;
        }
        pin.style.left = (projection.x * .5 + .5) * 100 + '%';
        pin.style.top = (-projection.y * .5 + .5) * 100 + '%';
        const bounds = pin.getBoundingClientRect();
        if (reserved.some(r => bounds.left < r.right && bounds.right > r.left && bounds.top < r.bottom && bounds.bottom > r.top)) visible = false;
      }
      candidates.push({ id: pin.dataset.spatialPin, visible, distance, x: projection?.x, y: projection?.y });
    }
    const selected = visiblePins(candidates);
    for (const pin of nodes) {
      const visible = selected.has(pin.dataset.spatialPin);
      pin.style.visibility = visible ? 'visible' : 'hidden';
      pin.style.pointerEvents = visible ? 'auto' : 'none';
      pin.setAttribute('aria-hidden', String(!visible));
      pin.tabIndex = visible ? 0 : -1;
    }
  }
  const pauseHiddenMedia = () => {
    if (document.hidden) active?.companyMedia?.pause();
  };
  document.addEventListener('visibilitychange', pauseHiddenMedia);
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - then) / 1000, .05);
    then = now;
    if (!alive || document.hidden) return;
    if (quality.id !== qualityProfile(getState().quality).id) {
      quality=qualityProfile(getState().quality);quality={...quality,anisotropy:Math.min(quality.anisotropy,renderer.capabilities.getMaxAnisotropy()),reflection:Math.min(quality.reflection,renderer.capabilities.maxTextureSize)};
      resize();for(const entry of cache.entries.values())entry.value?.updateQuality(quality);
      if(current)roomLighting(current);dirty=true;
    }
    if(lastStats?.paused!==Boolean(getState().paused))publishStats({paused:Boolean(getState().paused)});
    if (flightMotion) {
      const f = flightMotion,
        elapsed = now - f.start;
      el.dataset.flightPhase = elapsed < 1300 ? 'departing' : elapsed < f.duration ? 'airborne' : 'arriving';
      flight.update(Math.min(1, Math.max(0, (elapsed - 450) / (f.duration - 450))));
      let veil = elapsed < 280 ? elapsed / 280 : elapsed < 650 ? 1 - (elapsed - 280) / 370 : 0;
      if (elapsed >= f.duration && f.failed && stage !== 'error') {
        setError('load');
        setStage('error');
        getState().onError?.();
      }
      if (elapsed >= f.duration && f.room) {
        if (f.finishAt === null) f.finishAt = now;
        const finish = now - f.finishAt;
        veil = finish < 300 ? finish / 300 : 1 - (finish - 300) / 450;
        if (finish >= 300 && !f.swapped) {
          f.swapped = true;
          attach(f.t.scene, f.room);
          setCamera(f.destination);
        }
        if (finish >= 750) {
          flightMotion = null;
          el.dataset.flightPhase = 'idle';
          setFlightInfo(null);
          el.style.setProperty('--travel-veil', '0');
          complete(f.t);
        }
      }
      if (flightMotion) el.style.setProperty('--travel-veil', String(T.MathUtils.clamp(veil, 0, 1)));
      dirty = true;
    }
    if (active && active.userData.signLanguage !== getState().lang) {
      active.updateLanguage(getState().lang);
      dirty = true;
    }
    if (motion) {
      const m = motion,
        u = T.MathUtils.clamp((now - m.start) / m.duration, 0, 1),
        ease = u * u * (3 - 2 * u);
      if (m.rotationOnly) cam.quaternion.slerpQuaternions(m.fromQ, m.toQ, ease);else {
        const v = travelProgress(u, m.ramp),
          remaining = (1 - v) * m.curve.length;
        cam.position.fromArray(m.curve.at(v));
        const ahead = new T.Vector3(...m.curve.at(Math.min(1, v + 1.6 / m.curve.length)));
        ahead.y = cam.position.y;
        const focus = lookQ(m.view.look),
          heading = ahead.distanceTo(cam.position) > .01 ? lookQ(ahead.toArray()) : focus;
        const blend = T.MathUtils.smoothstep(1 - remaining / 4.2, 0, 1);
        heading.slerp(focus, blend);
        cam.quaternion.slerp(heading, 1 - Math.exp(-dt * 5));
      }
      dirty = true;
      if (u >= 1) {
        if (!m.rotationOnly) {
          motion = {
            rotationOnly: true,
            start: now,
            duration: 380,
            fromQ: cam.quaternion.clone(),
            toQ: m.view.quaternion ? new T.Quaternion().fromArray(m.view.quaternion) : lookQ(m.view.look),
            view: m.view,
            done: m.done
          };
        } else {
          motion = null;
          setCamera(m.view);
          m.done();
        }
      }
    }
    if (active?.companyMedia?.update(!getState().paused && stage === 'idle' && lastPoint === 'culture' && getState().ambientEnabled && !reducedMotion.matches)) dirty = true;
    cabin.update(doorOpen, dt);
    if (stage !== 'idle') dirty = true;
    // Camera touring is separate from the room's working objects. Walking past a
    // machine must not stop its motor; reading overlays and cabin transfers do.
    const roomWorking = !getState().paused && !flightMotion && (stage === 'idle' || stage === 'moving');
    if (roomWorking) {
      if (active?.exhibits?.update(dt, {point:lastPoint,paused:!getState().ambientEnabled,reducedMotion:reducedMotion.matches})) dirty = true;
      if (active?.ambient?.update(dt, {
        paused: !getState().ambientEnabled,
        holdPoint: positions._exhibitRotations?.[current + "/" + lastPoint] !== undefined ? lastPoint : null,
        reducedMotion: reducedMotion.matches
      })) dirty = true;
      if (current === 'office') {
        earth.update(getState().market || 'china', dt, {
          reducedMotion: reducedMotion.matches || !getState().ambientEnabled
        });
        dirty = true;
      }
    }
    if (active?.workingDisplays?.update(reducedMotion.matches ? 0 : active.ambient.time(), {lang:getState().lang})) dirty = true;
    // The shared daylight rig lights the promenade; local exhibit lights follow the active bay.
    // Far-side spotlights otherwise add per-pixel cost even when their bays are out of view.
    if (isRegional(current)) {
      const distances = [2, -10, -22].map(z => Math.abs(z - cam.position.z)),
        bank = distances.indexOf(Math.min(...distances));
      if (bank !== shadowBank) {
        shadowBank = bank;
        galleryLights.forEach((light, i) => {
          light.visible = Math.floor(i / 2) === bank;
          light.castShadow = light.visible;
          if (light.castShadow) light.shadow.needsUpdate = true;
        });
        renderer.shadowMap.needsUpdate = true;
      }
    }
    if (roomWorking && getState().ambientEnabled && !reducedMotion.matches && active?.ambient?.actors.length && now - shadowThen > 250) {
      key.shadow.needsUpdate = true;
      for (const light of galleryLights) if (light.visible && light.castShadow) light.shadow.needsUpdate = true;
      renderer.shadowMap.needsUpdate = true;
      shadowThen = now;
    }
    if (now - pinThen > 100) {
      projectPins();
      pinThen = now;
      el.dataset.position = cam.position.toArray().map(n => n.toFixed(3)).join(',');
      el.dataset.heading = cam.getWorldDirection(new T.Vector3()).toArray().map(n => n.toFixed(3)).join(',');
      el.dataset.signLanguage = active?.userData.signLanguage || '';
      el.dataset.signTexts = JSON.stringify(active?.userData.signTexts || []);
      el.dataset.cache = JSON.stringify([...cache.entries.keys()]);
      el.dataset.companyMedia = JSON.stringify(active?.companyMedia?.state || null);
      el.dataset.ambientTime = (active?.ambient?.time() || 0).toFixed(3);
      el.dataset.ambientActors = String(active?.ambient?.actors.length || 0);
      el.dataset.workingDisplays = JSON.stringify(active?.workingDisplays?.state || null);
      el.dataset.skyTime = earth.sky.time().toFixed(3);
      el.dataset.ambientMode = getState().paused ? 'paused' : !getState().ambientEnabled ? 'off' : reducedMotion.matches ? 'reduced' : 'living';
    }
    if (getState().paused && !motion && stage === 'idle' && !dirty) {
      el.dataset.rendering = 'paused';
      fpsStart = now;
      frameCount = 0;
      drawThen = now;
      return;
    }
    if (!dirty && !motion && !flightMotion && stage === 'idle') {drawThen=now;return;}
    if (now - drawThen < 15) return;
    drawThen = now;
    el.dataset.rendering = 'active';
    if (flightMotion && now - flightMotion.start >= 280 && !flightMotion.swapped) renderer.render(flight.scene, flight.camera);else renderer.render(world, cam);
    dirty = false;
    if(frameCount===0)fpsStart=now;
    frameCount++;
    if (now - fpsStart > 1500) {
      el.dataset.heapMiB = performance.memory ? String(Math.round(performance.memory.usedJSHeapSize / 1048576)) : 'unavailable';
      el.dataset.fps = String(Math.round(frameCount * 1000 / (now - fpsStart)));
      el.dataset.triangles = String(renderer.info.render.triangles);
      el.dataset.drawCalls = String(renderer.info.render.calls);
      el.dataset.geometries = String(renderer.info.memory.geometries);
      el.dataset.textures = String(renderer.info.memory.textures);
      publishStats({fps:Number(el.dataset.fps),triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,loadMs:Number(el.dataset.loadMs),paused:Boolean(getState().paused)});
      frameCount = 0;
      fpsStart = now;
    }
  }
  raf = requestAnimationFrame(tick);
  return {
    ...controls,
    dispose() {
      alive = false;
      document.removeEventListener('visibilitychange', pauseHiddenMedia);
      generation++;
      cancelAnimationFrame(raf);
      reducedMotion.removeEventListener('change', preferenceChanged);
      observer.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      cache.clear();
      galleryLights.forEach(light => light.shadow.map?.dispose());
      flight.dispose();
      earth.dispose();
      disposeGroup(earth.group);
      disposeGroup(earth.stars);
      cabin.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
