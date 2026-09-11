import Identity from './spatial/ui/Identity.jsx';
import { Check } from '@phosphor-icons/react';
import SpatialWorld from './spatial/SpatialWorld.jsx';
import { SCENES } from './spatial/catalog.js';
import { ShowroomProvider, useShowroom } from './spatial/host/ShowroomProvider.jsx';
import SceneChrome from './spatial/ui/SceneChrome.jsx';
import ElevatorDirectory from './spatial/ui/ElevatorDirectory.jsx';
import ContentHost from './spatial/ui/ContentHost.jsx';
import './spatial/world.css';
import { sceneTone } from './spatial/core/areas.js';
import { usePresenterControls } from './spatial/host/use-presenter-controls.js';
export default function App() {
  return <ShowroomProvider><Showroom /></ShowroomProvider>;
}
function Showroom() {
  usePresenterControls();
  const {
    visit: {
      target,
      actual,
      point,
      scene,
      moving,
      stage,
      auto,
      ready,
      overlay
    },
    preferences: {
      lang,
      ambientEnabled, quality, setRenderStats
    },
    content: {
      market,
      menu,
      company,
      loadError,
      toast
    },
    refs: {
      positions
    },
    commands: {
      interaction,
      arrived,
      clickedAction,
      readyWorld,
      errorWorld,
      recoverWorld,
      setStage
    },
    t,
    tx
  } = useShowroom();
  return <main className={`showroom tone-${sceneTone(scene, point)} ${moving ? 'travelling' : ''} ${overlay ? 'overlay-open' : ''} ${scene.journey ? 'process-promenade' : ''}`} data-scene={actual} data-travel={stage} data-auto={auto} data-language={lang} onPointerDownCapture={e => {
    // Keep a hotspot stable until its click; navigation performs takeover.
    if (!e.target.closest('[data-playback],[data-spatial-pin]')) interaction();
  }} onKeyDownCapture={event => {
    const activatingHotspot = ['Enter', ' '].includes(event.key) && event.target.closest?.('[data-spatial-pin]');
    if (!event.defaultPrevented && !activatingHotspot && !event.target.closest?.('[data-playback]')) interaction();
  }}>
  <SpatialWorld quality={quality} onStats={setRenderStats} target={target} paused={overlay} ambientEnabled={ambientEnabled} lang={lang} market={market} positions={positions} onStage={setStage} onReady={readyWorld} onArrival={arrived} onAction={clickedAction} onError={errorWorld} onRecover={recoverWorld} />
  <div className="scene-interface" inert={overlay ? true : undefined}><SceneChrome /></div>
  {moving && ready && (!auto || stage === 'loading') && <div className="journey-chip" role="status"><span className="journey-pulse" />{stage === 'loading' ? t('正在开启下一空间', 'Preparing your next space') : stage === 'closing' ? t('电梯关门 · 即将出发', 'Doors closing · Departing') : stage === 'opening' ? t('已经抵达 · 电梯开门', 'Arriving · Doors opening') : t('前往 ', 'Travelling to ') + tx(SCENES[target.scene].name)}</div>}
  {(!ready || !company) && !loadError && <div className="world-loading"><Identity lang={lang} /><span className="loading-orbit" /><p>{t('正在点亮展厅世界', 'Bringing our world to life')}</p></div>}
  {loadError && <div className="world-loading"><h2>{t('公司资料暂时未能载入', 'Company content could not load')}</h2><button onClick={() => location.reload()}>{t('重新载入', 'Reload')}</button></div>}
  {menu && <ElevatorDirectory />}
  <ContentHost />
  {toast && <div className="world-toast" role="status"><Check />{toast}</div>}
 </main>;
}
