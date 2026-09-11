import Identity from './Identity.jsx';
import { useEffect, useState } from 'react';
import { ArrowLeft, Play, Elevator, Translate, Path, Plus } from '@phosphor-icons/react';
import { useShowroom } from '../host/ShowroomProvider.jsx';
import JourneyGuide from '../JourneyGuide.jsx';
import RoomGuide from './RoomGuide.jsx';
import { areaAt, sceneTone } from '../core/areas.js';
import './tour-presentation.css';
import './spatial-intent.css';
import IconControl from './IconControl.jsx';
export default function SceneChrome() {
  const {
    visit: {
      scene,
      actual,
      point,
      floor,
      moving,
      auto
    },
    preferences: {
      lang,
      setLang
    },
    commands: {
      navigate,
      showPanel,
      back,
      setPlaying,
      openMenu
    },
    t,
    tx
  } = useShowroom();
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => setGuideOpen(false), [actual, point, auto]);
  return <>
   <header className="world-header"><div className="world-identity"><button className="world-brand" onClick={() => navigate('lobby')} aria-label={t('返回欢迎大厅', 'Return to welcome hall')}><Identity lang={lang} /></button><div className="world-location" hidden={auto}><span>{String(floor.number).padStart(2, '0')}F</span><div><small>{tx(floor.name)}</small><strong>{tx(scene.name)}{areaAt(scene, point) ? ' / ' + tx(areaAt(scene, point).name) : ''}</strong></div></div></div><span className="concept-label">{t('三维概念展厅', '3D CONCEPT SHOWROOM')}</span></header>
   {!auto && guideOpen && !scene.journey && <RoomGuide initialExpanded />}
   <div className="scene-pins">{scene.points.map(p => <button key={p.id} data-spatial-pin={p.id} data-focused={!auto && guideOpen && point === p.id ? 'true' : 'false'} className={'scene-pin ' + (point === p.id ? 'selected' : '')} aria-label={tx(p.name)} onClick={() => navigate(actual, p.id, p.action.type === 'scene' ? null : p.action)}><span className="pin-dot" aria-hidden="true"><Plus /></span><span className="pin-label">{tx(p.name)}</span></button>)}</div>
   {!auto && guideOpen && scene.journey && <JourneyGuide scene={actual} point={point} lang={lang} moving={moving} onPoint={at => navigate(actual, at)} onDetails={chapter => showPanel({
      type: 'region',
      id: actual,
      chapter
    })} onReturn={() => navigate('office', 'earth', null, {
      restore: true
    })} />}
   <nav className="system-dock" hidden={auto} aria-label={t('展厅系统导航', 'Showroom controls')}>
     <IconControl label={t('电梯', 'Elevator')} onClick={openMenu}><Elevator /></IconControl>
     <IconControl label={t('返回', 'Back')} onClick={back}><ArrowLeft /></IconControl>
     <IconControl label={t('路线与内容', 'Route & content')} aria-expanded={guideOpen} onClick={() => setGuideOpen(v => !v)}><Path /></IconControl>
     <i />
     <IconControl label={t('切换到英文', 'Switch to Chinese')} onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}><Translate /></IconControl>
     <IconControl label={t('继续巡游', 'Continue tour')} data-playback onClick={setPlaying}><Play /></IconControl>
   </nav>
</>;
}
