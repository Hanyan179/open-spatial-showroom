import { useState } from 'react';
import { ArrowRight, ArrowLeft, MapPin, GearSix, Sparkle, ArrowsOut, AirplaneTilt } from '@phosphor-icons/react';
import { SCENES } from '../catalog.js';
import { useShowroom } from '../host/ShowroomProvider.jsx';
import { REGISTRY } from '../core/scene-registry.js';
import { sceneAreas, areaAt } from '../core/areas.js';
import Dialog from './Dialog.jsx';
import DisplaySettings from './DisplaySettings.jsx';
import './directory.css';
export default function ElevatorDirectory() {
  const { visit: { actual, point, floor }, preferences: { ambientEnabled, toggleAmbient }, commands: { navigate, closeMenu, fullscreen }, t, tx } = useShowroom();
  const [floorId, setFloor] = useState(floor.id), [roomId, setRoom] = useState(actual), [settings, setSettings] = useState(false);
  const selectedFloor = REGISTRY.directory.find(f => f.id === floorId);
  const room = SCENES[roomId], here = actual === roomId;
  const chooseFloor = f => { setSettings(false); setFloor(f.id); setRoom(f.id === floor.id ? actual : f.rooms[0].id); };
  const destination = s => s.journey ? (s.id === 'china' ? t('前往中国创研', 'Visit creative work in China') : t('飞往', 'Fly to ') + tx(s.name).split(' · ')[0]) : t('前往', 'Visit ') + tx(s.name);
  return <Dialog title={t('电梯', 'Elevator')} close={closeMenu} className="elevator-layout">
    <header className="elevator-header"><div><span className="section-kicker">{t('电梯 · 参观导航', 'ELEVATOR · VISITOR GUIDE')}</span><h1>{t('下一站，去哪里？', 'Where shall we go next?')}</h1></div><p><MapPin /><span>{t('当前位置', 'YOU ARE HERE')}<strong>{floor.number}F / {tx(SCENES[actual].name)}{areaAt(SCENES[actual], point) ? ' / ' + tx(areaAt(SCENES[actual], point).name) : ''}</strong></span></p></header>
    <aside className="elevator-sidebar"><nav aria-label={t('选择楼层', 'Choose a floor')}>{REGISTRY.directory.map(f => <button key={f.id} aria-pressed={floorId === f.id} onClick={() => chooseFloor(f)}><b>{f.number}F</b><span>{tx(f.name)}{f.id === floor.id && <small>{t('您所在楼层', 'YOUR CURRENT FLOOR')}</small>}</span><ArrowRight /></button>)}</nav><div className="elevator-settings"><button aria-expanded={settings} onClick={() => setSettings(v => !v)}><GearSix />{t('展示设置', 'Display settings')}</button></div><button className="elevator-return" onClick={closeMenu}><ArrowLeft />{t('返回参观', 'Back to your visit')}</button></aside>
    {settings ? <DisplaySettings /> : <section className="elevator-destinations" aria-label={t('房间与体验区', 'Rooms and areas')}>
      <div className="elevator-floor-heading"><h2>{selectedFloor.number}F · {tx(selectedFloor.name)}</h2><span>{t('选择房间，再前往', 'Choose a room, then visit')}</span></div>
      <div className="elevator-room-list">{selectedFloor.rooms.map(s => <button key={s.id} aria-pressed={roomId === s.id} onClick={() => setRoom(s.id)}><span>{tx(s.name)}</span>{actual === s.id ? <small>{t('您在这里', 'YOU ARE HERE')}</small> : <ArrowRight />}</button>)}</div>
      {selectedFloor.regions.length > 0 && <div className="elevator-regions"><span>{t('全球业务目的地', 'GLOBAL DESTINATIONS')}</span>{selectedFloor.regions.map(s => <button key={s.id} aria-pressed={roomId === s.id} onClick={() => setRoom(s.id)}>{s.id !== 'china' && <AirplaneTilt />}{tx(s.name).split(' · ')[0]}{actual === s.id && <small>{t('您在这里', 'YOU ARE HERE')}</small>}</button>)}</div>}
      <div className="elevator-room-detail"><div className="elevator-room-intro"><span className="section-kicker">{here ? t('当前房间', 'CURRENT ROOM') : t('目的地预览', 'YOUR DESTINATION')}</span><h3>{tx(room.name)}</h3><p>{tx(room.summary)}</p><button className="elevator-go" onClick={() => here ? closeMenu() : navigate(room.id)}>{here ? t('返回当前房间', 'Return to this room') : destination(room)}<ArrowRight /></button></div>
        <div className={"elevator-areas " + (sceneAreas(room).length >= 4 ? "area-grid" : "")}><h3>{here ? t('本房间体验区', 'AREAS IN THIS ROOM') : t('到达后可以体验', 'WHAT TO EXPLORE')}</h3>{sceneAreas(room).map(area => <section key={area.id}>{(sceneAreas(room).length >= 4 || area.points.length > 1 || tx(area.name) !== tx(room.points.find(p => p.id === area.points[0]).name)) && <h4>{tx(area.name)}</h4>}{area.summary && <p>{tx(area.summary)}</p>}<div>{area.points.map(id => { const p = room.points.find(v => v.id === id); const current = here && (point === id || point === id + '-opposite'); return <button key={id} aria-current={current ? 'location' : undefined} onClick={() => current ? closeMenu() : navigate(room.id, id)}><span>{current ? t('正在这里 · ', 'HERE · ') : t('前往 · ', 'VISIT · ')}{tx(p.name)}</span><ArrowRight /></button>; })}</div></section>)}</div>
      </div>
    </section>}
  </Dialog>;
}
