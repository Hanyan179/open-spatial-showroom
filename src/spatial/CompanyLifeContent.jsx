import {useEffect,useRef,useState} from 'react';
import {Images,Television,Play,ArrowLeft,ArrowRight,Plus,Minus,ArrowsCounterClockwise} from '@phosphor-icons/react';
import {loadCompanyLife,mediaText} from './company-life';
import './company-life.css';

export default function CompanyLifeContent({lang,kind='photos',index,memory,onKind}){
 const t=(zh,en)=>lang==='zh'?zh:en;
 const [data,setData]=useState(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 const [selected,setSelected]=useState(()=>({...memory.current.selected,...(index===undefined?{}:{[kind]:index})}));
 const [imageError,setImageError]=useState(false),[zoom,setZoom]=useState(1),[pan,setPan]=useState([0,0]);
 const drag=useRef(),imageBox=useRef();
 useEffect(()=>{const abort=new AbortController();setError(false);loadCompanyLife(abort.signal).then(setData).catch(e=>{if(e.name!=='AbortError')setError(true);});return()=>abort.abort();},[attempt]);
 const items=data?.[kind]||[],current=Math.min(selected[kind]||0,Math.max(0,items.length-1)),item=items[current];
 useEffect(()=>{memory.current.selected=selected;},[selected]);
 useEffect(()=>{setImageError(false);setZoom(1);setPan([0,0]);},[item?.id,kind]);
 function choose(n){setSelected(s=>({...s,[kind]:Math.max(0,Math.min(items.length-1,n))}));}
 function scale(delta){setZoom(z=>Math.max(1,Math.min(3,z+delta)));setPan([0,0]);}
 const title=t('公司日常','Life at Showroom');
 return <section className="company-life" data-media-kind={kind}>
  <aside><span className="section-kicker">{t('展厅 · 每一天','SHOWROOM · EVERY DAY')}</span><h1>{title}</h1><p>{t('在工作里创造，\n在相聚中连接。','Creating through our work.\nConnecting through shared moments.')}</p>
   <nav aria-label={t('公司媒体类型','Company media type')}>{[['photos','照片墙','Photographs',Images],['videos','公司影像','Company films',Television]].map(([key,zh,en,Icon])=><button key={key} aria-pressed={kind===key} onClick={()=>onKind(key)}><Icon/>{t(zh,en)}<small>{data?.[key].length??'—'}</small></button>)}</nav>
   <footer>{t('团队 · 工作 · 活动','PEOPLE · WORK · TOGETHER')}</footer>
  </aside>
  <div className="life-content">
   {error?<div className="life-empty" role="alert"><h2>{t('日常影像暂时未能载入','Company media could not load')}</h2><p>{t('请重试，或关闭后继续参观。','Try again, or close to continue your visit.')}</p><button onClick={()=>setAttempt(v=>v+1)}>{t('重新载入','Retry')}</button></div>:!data?<div className="life-empty" role="status">{t('正在载入影像','Loading company media')}</div>:!item?<div className="life-empty">
    <div className={kind==='photos'?'empty-photo-frame':'empty-tv-frame'}>{kind==='photos'?<Images/>:<Television/>}<span>{t('内容待更新','COMING SOON')}</span></div>
    <h2>{kind==='photos'?t('值得留下的每一刻','Moments worth keeping'):t('让日常故事，在这里上映','A place for everyday stories')}</h2>
    <p>{kind==='photos'?t('公司的团队、活动与工作照片将在这里呈现。','Team, event and work photographs will appear here.'):t('公司日常、团队活动与工作记录将在这里播放。','Company life, team events and work films will play here.')}</p>
   </div>:<>
    <div className="life-media-heading"><div><small>{mediaText(item.category,lang)||t('公司日常','Company life')}{item.date?' / '+item.date:''}</small><h2>{mediaText(item.title,lang)||t('日常影像','Company media')}</h2></div><span>{current+1} / {items.length}</span></div>
    <div className="life-stage">
     {kind==='videos'?<CompanyFilm key={item.id} item={item} lang={lang} memory={memory}/>:<>
      <div className={'life-photo '+(zoom>1?'zoomed':'')} ref={imageBox} onPointerDown={e=>{if(zoom<=1)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,pan};}} onPointerMove={e=>{if(drag.current?.id!==e.pointerId)return;const box=imageBox.current.getBoundingClientRect(),limitX=box.width*(zoom-1)/2,limitY=box.height*(zoom-1)/2;setPan([Math.max(-limitX,Math.min(limitX,drag.current.pan[0]+e.clientX-drag.current.x)),Math.max(-limitY,Math.min(limitY,drag.current.pan[1]+e.clientY-drag.current.y))]);}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
       {imageError?<p role="alert">{t('这张照片暂时无法显示，请选择另一张。','This photograph is unavailable. Please select another.')}</p>:<img src={item.src} alt={mediaText(item.alt||item.title,lang)} draggable="false" onError={()=>setImageError(true)} style={{transform:`translate(${pan[0]}px,${pan[1]}px) scale(${zoom})`}}/>}
      </div>
      {!imageError&&<div className="life-zoom"><button aria-label={t('缩小照片','Zoom out')} disabled={zoom<=1} onClick={()=>scale(-.5)}><Minus/></button><span>{Math.round(zoom*100)}%</span><button aria-label={t('放大照片','Zoom in')} disabled={zoom>=3} onClick={()=>scale(.5)}><Plus/></button><button aria-label={t('还原照片','Reset photograph')} onClick={()=>{setZoom(1);setPan([0,0]);}}><ArrowsCounterClockwise/></button>{zoom>1&&<small>{t('拖动查看','Drag to explore')}</small>}</div>}
     </>}
    </div>
    <div className="life-media-caption"><p>{mediaText(item.caption,lang)}</p>{item.credit&&<small>{mediaText(item.credit,lang)}</small>}</div>
    <nav className="life-filmstrip" aria-label={t('切换影像','Choose media')}><button aria-label={t('上一个','Previous')} disabled={current===0} onClick={()=>choose(current-1)}><ArrowLeft/></button><div>{items.map((media,i)=><button key={media.id} aria-pressed={i===current} onClick={()=>choose(i)} title={mediaText(media.title,lang)}><span>{String(i+1).padStart(2,'0')}</span>{mediaText(media.title,lang)||t('日常影像','Company media')}</button>)}</div><button aria-label={t('下一个','Next')} disabled={current===items.length-1} onClick={()=>choose(current+1)}><ArrowRight/></button></nav>
   </>}
  </div>
 </section>;
}

function CompanyFilm({item,lang,memory}){
 const ref=useRef(),[error,setError]=useState(false),[playing,setPlaying]=useState(false),t=(zh,en)=>lang==='zh'?zh:en;
 useEffect(()=>{const video=ref.current;const hide=()=>{if(document.hidden)video?.pause();};document.addEventListener('visibilitychange',hide);return()=>{if(video){memory.current.times[item.id]=video.currentTime;video.pause();video.removeAttribute('src');video.load();}document.removeEventListener('visibilitychange',hide);};},[item.id]);
 return error?<div className="life-empty" role="alert"><h2>{t('这段视频暂时无法播放','This film is unavailable')}</h2><p>{t('请选择其他视频，或稍后重新打开。','Choose another film or try again later.')}</p></div>:<><video ref={ref} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} src={item.src} poster={item.poster||undefined} controls muted playsInline preload="metadata" tabIndex={0} aria-label={mediaText(item.title,lang)} onLoadedMetadata={e=>{const saved=memory.current.times[item.id]||0;if(saved>0&&saved<e.currentTarget.duration)e.currentTarget.currentTime=saved;}} onTimeUpdate={e=>{memory.current.times[item.id]=e.currentTarget.currentTime;}} onError={()=>setError(true)}>{t('当前浏览器不支持播放此视频。','This browser cannot play this video.')}</video>{!playing&&<button className="life-play" onClick={()=>ref.current?.play().catch(()=>setError(true))}><Play/>{t('播放影片','Play film')}</button>}</>;
}
