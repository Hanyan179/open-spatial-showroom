import { useEffect, useRef, useState } from 'react';
import { qualityProfile } from '../core/render-quality.js';
import { loadCompany, loadConfiguration } from '../resource-client.js';
import { SCENES, STATE_VERSION, parseRoute, legacyContent, floorOf } from '../catalog.js';
import { REGISTRY } from '../core/scene-registry.js';
import { normalizeLanguage, translator } from '../core/i18n.js';
import { readPreference, writePreference } from '../core/preferences.js';
import { resolveAction, hotspotDestination } from '../core/action-router.js';
import { VisitSession } from '../core/visit-session.js';
import { useGuidedTour } from './use-guided-tour.js';
export default function useShowroomController() {
  const initialLegacy = useRef(legacyContent(location.hash));
  const initial = useRef(parseRoute(location.hash)),
    session = useRef(new VisitSession()),
    [target, setTarget] = useState({
      ...initial.current,
      request: 1
    }),
    [actual, setActual] = useState(initial.current.scene),
    [point, setPoint] = useState(initial.current.point),
    [ready, setReady] = useState(false),
    [stage, setStage] = useState('loading');
  const [lang, setLang] = useState(() => normalizeLanguage(readPreference('showroom-lang', 'zh'))),
    [auto, setAuto] = useState(true),
    [quality, setQualityState] = useState(() => qualityProfile(readPreference('showroom-quality','clear')).id),
    [renderStats, setRenderStats] = useState(null),
    [ambientEnabled, setAmbientEnabled] = useState(() => readPreference('showroom-ambient', true)),
    [menu, setMenu] = useState(false),
    [panel, setPanel] = useState(null),
    [explorerTarget, setExplorerTarget] = useState(null),
    [explorerSection, setExplorerSection] = useState('products'),
    [moduleBack, setModuleBack] = useState(0),
    [market, setMarket] = useState('china'),
    [company, setCompany] = useState(null),
    [loadError, setLoadError] = useState(false),
    [toast, setToast] = useState('');
  const productMemory = useRef({
    selected: {},
    views: {}
  });
  const lifeMemory = useRef({
    selected: {
      photos: 0,
      videos: 0
    },
    times: {}
  });
  const contentBox = useRef(),
    contentBack = useRef(null),
    priorFocus = useRef();
  const positions = useRef(readPreference(STATE_VERSION + '-positions', {})),
    idle = useRef(Date.now()),
    dwell = useRef(Date.now()),
    panelStack = useRef([]),
    latest = useRef();
  latest.current = {
    auto,
    menu,
    panel,
    stage,
    actual,
    point,
    target,
    ready
  };
  const {
    t,
    tx
  } = translator(lang);
  const scene = SCENES[actual],
    floor = floorOf(actual),
    moving = stage !== 'idle' && stage !== 'error';
  useEffect(() => {
    loadCompany().then(setCompany).catch(() => setLoadError(true));
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    loadConfiguration().then(config => { document.title = config.identity?.title?.[lang] || t('三维交互展厅','Interactive 3D Showroom'); }).catch(()=>{});
    writePreference('showroom-lang', lang);
  }, [lang]);
  const interaction = () => {
    idle.current = Date.now();
    if (latest.current.auto) setAuto(false);
  };
  const setQuality = id => { const next=qualityProfile(id).id;setQualityState(next);writePreference('showroom-quality',next);interaction(); };
  const notify = message => {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  };
  function navigate(id, at = 'overview', action = null, {
    remember = true,
    touring = false,
    restore = false,
    fromHistory = false
  } = {}) {
    if (!REGISTRY.hasView(id, at)) return;
    if (SCENES[id].journey) setMarket(id);
    if (!touring) interaction();
    const current = latest.current;
    setMenu(false);
    setPanel(null);
    panelStack.current = [];
    const next = session.current.issue({
      scene: current.actual,
      point: current.point
    }, {
      scene: id,
      point: at,
      restore,
      touring
    }, action, remember);
    setTarget(next);
    if (!fromHistory) history[touring ? 'replaceState' : 'pushState']({
      space: STATE_VERSION,
      ...next
    }, '', `#/${id}${at === 'overview' ? '' : '/' + at}`);
  }
  function showPanel(next, remember = false) {
    interaction();
    setMenu(false);
    if (remember && panel) panelStack.current.push(panel);else panelStack.current = [];
    setPanel(next);
  }
  function explore(value) {
    setExplorerSection(value.section || 'products');
    setExplorerTarget({
      ...value,
      ...(value.brand || value.product || value.domain ? {
        request: ++session.current.sequence
      } : {})
    });
    showPanel({
      type: 'explorer'
    }, Boolean(panel));
  }
  function finishExplorer() {
    if (panelStack.current.length) setPanel(panelStack.current.pop());else setPanel(null);
    idle.current = Date.now();
  }
  function act(action, context = latest.current.actual) {
    if (!action) return;
    try {
      const effect = resolveAction(action, context);
      if (effect.market) setMarket(effect.market);
      if (effect.kind === 'navigate') navigate(effect.scene);else if (effect.kind === 'directory') {
        interaction();
        setMenu(true);
      } else if (effect.kind === 'explorer') explore(effect.target);else if (effect.kind === 'panel') showPanel(effect.panel);
    } catch (error) {
      console.error(error);
      notify(t('这个内容入口暂时不可用', 'This content entry is unavailable'));
    }
  }
  function visitMedia(kind) {
    navigate('lobby', kind === 'news' ? 'lounge' : 'culture', kind === 'news' ? {
      type: 'resource',
      id: 'news'
    } : {
      type: 'life',
      kind: 'videos',
      at: 'culture'
    });
  }
  function clickedAction(action) {
    const target = hotspotDestination(action, latest.current.actual, latest.current.point);
    if (target && target.scene === latest.current.actual && target.point === latest.current.point && latest.current.stage === 'idle') {
      act(action);
      return;
    }
    if (target) navigate(target.scene, target.point, target.action);else act(action);
  }
  function arrived(value) {
    setActual(value.scene);
    setPoint(value.point || 'overview');
    dwell.current = Date.now();
    writePreference(STATE_VERSION + '-positions', positions.current);
    if (value.request === latest.current.target.request) {
      const action = session.current.arrive(value.request);
      if (action) act(action, value.scene);else if (value.request === 1 && initialLegacy.current) {
        const initialAction = initialLegacy.current;
        initialLegacy.current = null;
        act(initialAction);
      }
    }
  }
  function closePanel(all = false) {
    if (!all && contentBack.current?.()) return;
    if (!all && latest.current.panel?.type === 'explorer') {
      setModuleBack(v => v + 1);
      return;
    }
    if (!all && panelStack.current.length) setPanel(panelStack.current.pop());else {
      setPanel(null);
      panelStack.current = [];
    }
    idle.current = Date.now();
  }
  function back() {
    interaction();
    if (panel) {
      closePanel();
      return;
    }
    if (menu) {
      setMenu(false);
      idle.current = Date.now();
      return;
    }
    const prev = session.current.back();
    navigate(prev?.scene || 'lobby', prev?.point || 'overview', null, {
      remember: false,
      restore: Boolean(prev)
    });
  }
  useEffect(() => {
    history.replaceState({
      space: STATE_VERSION,
      ...target
    }, '', location.hash || '#/lobby');
    const pop = () => {
      const route = parseRoute(location.hash);
      navigate(route.scene, route.point, legacyContent(location.hash), {
        remember: false,
        restore: true,
        fromHistory: true
      });
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    const key = e => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        if (latest.current.menu) {
          setMenu(false);
          idle.current = Date.now();
        } else if (latest.current.panel) closePanel();else setAuto(false);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useGuidedTour({
    latest,
    idle,
    dwell,
    setAuto,
    navigate
  });
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();else await document.documentElement.requestFullscreen();
    } catch {
      notify(t('请使用浏览器的全屏功能', 'Use your browser’s fullscreen control'));
    }
  }
  useEffect(() => {
    if (!panel) {
      if (priorFocus.current?.isConnected) priorFocus.current.focus();
      return;
    }
    priorFocus.current = document.activeElement;
    contentBox.current?.querySelector('button')?.focus();
  }, [Boolean(panel)]);
  const setPlaying = () => {
    setAuto(v => !v);
    dwell.current = Date.now();
    idle.current = Date.now();
  };
  const overlay = Boolean(menu || panel),
    moduleOpen = panel?.type === 'explorer';
  const closeMenu = () => {
    setMenu(false);
    idle.current = Date.now();
  };
  const toggleAmbient = () => setAmbientEnabled(v => {
    writePreference('showroom-ambient', !v);
    return !v;
  });
  const readyWorld = () => {
    setReady(true);
    dwell.current = Date.now();
  };
  const errorWorld = () => {
    setAuto(false);
    setReady(true);
  };
  const recoverWorld = id => {
    session.current.cancel();
    setTarget(v => ({
      ...v,
      scene: id,
      point: 'overview'
    }));
    history.replaceState({
      space: STATE_VERSION,
      scene: id,
      point: 'overview'
    }, '', `#/${id}`);
  };
  const selectSection = section => {
    setExplorerSection(section);
    setExplorerTarget({
      section,
      request: ++session.current.sequence
    });
  };
  return {
    visit: {
      target,
      actual,
      point,
      ready,
      stage,
      scene,
      floor,
      moving,
      auto,
      overlay
    },
    preferences: {
      lang,
      setLang,
      ambientEnabled,
      toggleAmbient,
      quality, setQuality, renderStats, setRenderStats
    },
    content: {
      market,
      panel,
      setPanel,
      company,
      loadError,
      menu,
      toast,
      moduleOpen,
      explorerTarget,
      explorerSection,
      moduleBack
    },
    refs: {
      positions,
      contentBox,
      contentBack,
      productMemory,
      lifeMemory
    },
    commands: {
      setStage,
      navigate,
      showPanel,
      explore,
      finishExplorer,
      act,
      visitMedia,
      clickedAction,
      arrived,
      closePanel,
      back,
      fullscreen,
      setPlaying,
      interaction,
      closeMenu,
      selectSection,
      readyWorld,
      errorWorld,
      recoverWorld,
      openMenu: () => setMenu(true),
      setExplorerSection
    },
    t,
    tx
  };
}
