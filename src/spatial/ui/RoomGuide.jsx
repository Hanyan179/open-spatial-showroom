import { useState } from 'react';
import { ArrowRight, ArrowLeft, BookOpen, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useShowroom } from '../host/ShowroomProvider.jsx';
import { areaAt, orderedStops } from '../core/areas.js';
import './room-guide.css';
export default function RoomGuide({ initialExpanded = false }) {
  const { visit: { actual, scene, point, moving }, commands: { navigate, clickedAction, explore, showPanel }, t, tx } = useShowroom();
  const stops = orderedStops(scene), index = stops.findIndex(p => p.id === point), stop = stops[index], area = areaAt(scene, point);
  const next = stops[index + 1];
  const context = actual + '/' + point;
  const [expandedAt, setExpandedAt] = useState(initialExpanded ? context : null);
  const expanded = expandedAt === context;
  const primary = () => stop ? clickedAction(stop.action) : next && navigate(actual, next.id);
  const label = !stop ? '' : stop.action.type === 'scene' ? t('进入这个产品房间', 'Enter this product room') : stop.action.type === 'roomProducts' ? t('浏览这个分类', 'Browse this category') : stop.action.type === 'catalog' ? t('打开产品与档案', 'Open products & archives') : stop.action.type === 'resource' && stop.action.id === 'products' ? t('打开线上产品平台入口', 'Open the product platform gateway') : t('查看这里的内容', 'Explore this display');
  return <section className={'room-guide ' + (index < 0 ? 'overview ' : '') + (moving ? 'in-motion ' : '') + (expanded ? 'expanded' : 'compact')} inert={moving ? true : undefined} aria-hidden={moving || undefined} data-side={stop?.guideSide || 'left'} aria-label={t('房间探索', 'Room exploration')}>
    <div className="room-guide-summary">
      <div className="room-guide-title">
    <div className="room-guide-kicker"><span>{index < 0 ? t('房间入口', 'ROOM ENTRANCE') : `${String(index + 1).padStart(2, '0')} / ${String(stops.length).padStart(2, '0')}`}</span><span>{index < 0 ? tx(scene.tag) : tx(area?.name)}</span></div>
    <h1>{stop ? tx(stop.name) : tx(scene.name)}</h1>
      </div>
      <button className="room-guide-toggle" aria-label={expanded ? t('收起导览','Collapse guide') : t('路线与内容','Route & content')} aria-expanded={expanded} aria-controls="room-guide-body" onClick={() => setExpandedAt(expanded ? null : context)}>{expanded ? <CaretDown /> : <CaretUp />}<span>{expanded ? t('收起导览','Collapse guide') : t('路线与内容','Route & content')}</span></button>
    </div>
    {!expanded && <button disabled={moving} className="room-guide-quick" onClick={primary}>{stop ? label : t('开始探索','Begin exploring')}<ArrowRight /></button>}
    <div id="room-guide-body" className="room-guide-body" hidden={!expanded}>
    <p>{stop ? tx(area?.summary || scene.summary) : tx(scene.summary)}</p>
    {stop?.inspectable && <small className="room-guide-hint">{t('拖动台上展品旋转 · 三维陈列示意', 'Drag the exhibit to rotate · Display interpretation')}</small>}
    <div className="room-guide-actions">
      {index < 0 && scene.domain && <button className="room-guide-primary" onClick={()=>showPanel({type:'roomProducts',domain:scene.domain,category:'all'})}>{t('浏览本房间全部产品','Browse all room products')}<BookOpen/></button>}
      {stop && <button disabled={moving} className="room-guide-primary" onClick={() => clickedAction(stop.action)}><BookOpen />{label}</button>}
      {next ? <button disabled={moving} onClick={() => navigate(actual, next.id)}>{index < 0 ? t('开始探索', 'Begin exploring') : t('下一站 · ', 'Next · ') + tx(next.name)}<ArrowRight /></button> : scene.domain ? <button disabled={moving} onClick={() => navigate('samples')}><ArrowLeft />{t('返回样品导览室', 'Back to sample orientation')}</button> : <button disabled={moving} onClick={() => navigate(actual)}>{t('回到入口', 'Back to the entrance')}<ArrowLeft /></button>}
    </div>
    {point === 'library' && <div className="room-library-actions" aria-label={t('查询内容', 'Library sections')}>
      {scene.domain && <button disabled={moving} onClick={()=>showPanel({type:'roomProducts',domain:scene.domain,category:'all'})}>{t('本房间产品分类','Room product categories')}</button>}
      {['products','categories','brands'].map((section,i) => <button key={section} disabled={moving} onClick={() => explore({section, domain:scene.domain})}>{[t('概念样品','Concept samples'), t('档案品类','Archive categories'), t('品牌档案','Brand records')][i]}</button>)}
      {actual === 'samples' && <button disabled={moving} onClick={() => showPanel({type:'resource',id:'products'})}>{t('线上产品平台','Online product platform')}</button>}
    </div>}
    <nav className="room-stop-list" aria-label={t('本房间参观路线', 'Stops in this room')}>{stops.map((p,i) => <button key={p.id} aria-label={t('前往','Visit ') + tx(p.name)} aria-current={point === p.id ? 'step' : undefined} onClick={() => navigate(actual,p.id)}><span>{String(i+1).padStart(2,'0')}</span>{tx(p.name)}</button>)}</nav>
    </div>
  </section>;
}
