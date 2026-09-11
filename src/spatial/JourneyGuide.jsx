import {ArrowRight,ArrowLeft,ArrowsLeftRight,Plus} from '@phosphor-icons/react';
import {REGION_JOURNEYS,journeyIndex} from './regional-journeys';
export default function JourneyGuide({scene,point,lang,moving,onPoint,onDetails,onReturn}){
 const j=REGION_JOURNEYS[scene],l=lang==='zh'?0:1,t=(zh,en)=>l?en:zh,i=journeyIndex(scene,point),s=j.steps[i],opposite=point.endsWith('-opposite');
 return <div className={'journey-guide '+(moving?'in-motion':'')}>
  <section className="journey-story" inert={moving ? true : undefined} aria-hidden={moving || undefined} aria-live="polite"><span className="section-kicker">{i<0?t('沿中央长廊，逐步探索','FOLLOW THE CENTRAL PROMENADE'):String(i+1).padStart(2,'0')+' / 03 · '+s.sides[opposite?1:0][l]}</span><h1>{i<0?j.name[l]:s.name[l]}</h1><p>{i<0?t('从中间前行，走近两侧的工作场景。','Move along the centre and discover the workspaces on either side.'):s.description[l]}</p>
   <div className="journey-actions">{s&&<><button disabled={moving} onClick={()=>onDetails(i)}><Plus/>{t('环节详解','Explore this stage')}</button><button disabled={moving} onClick={()=>onPoint(s.id+(opposite?'':'-opposite'))}><ArrowsLeftRight/>{t('看看另一侧','See the other side')}</button></>}
    <button className="journey-forward" disabled={moving} onClick={()=>i<2?onPoint(j.steps[i+1].id):onReturn()}>{i<0?t('开始参观','Begin the visit'):i<2?t('继续到','Continue to')+' '+j.steps[i+1].name[l]:t('返回战略办公室','Return to strategy office')}<ArrowRight/></button>
   </div>
  </section>
  <nav className="journey-chapters" aria-label={t('长廊参观环节','Promenade stages')}><span>{t('参观路线','YOUR ROUTE')}</span>{j.steps.map((step,n)=><button key={step.id} aria-current={i===n?'step':undefined} onClick={()=>onPoint(step.id)}><b>{String(n+1).padStart(2,'0')}</b><span>{step.name[l]}</span><ArrowRight/></button>)}{i>=0&&<button className="journey-start" onClick={()=>onPoint('overview')}><ArrowLeft/><span>{t('回到长廊入口','Back to the entrance')}</span></button>}</nav>
 </div>;
}
