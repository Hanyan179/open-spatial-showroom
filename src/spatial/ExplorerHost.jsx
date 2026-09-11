import {useEffect,useRef,useState} from 'react';
import {EXPLORER_CHANNEL as CHANNEL,EXPLORER_VERSION,isExplorerMessage,LanguageHandshake} from './core/explorer-protocol.js';
export default function ExplorerHost({open,target,lang,onLanguage,onClose,onInteraction,onScene,onSection,backRequest}){
 const initialLanguage=useRef(lang),languageSync=useRef(new LanguageHandshake());const frame=useRef(),latest=useRef(),lastTarget=useRef(null),[started,setStarted]=useState(open),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 latest.current={open,target,lang,onLanguage,onClose,onInteraction,onScene,onSection};
 if(!started)initialLanguage.current=lang;
 const send=(type,body={})=>frame.current?.contentWindow?.postMessage({channel:CHANNEL,version:EXPLORER_VERSION,type,...body},location.origin);
 const sync=()=>{const s=latest.current;send('visibility',{visible:s.open});languageSync.current.expect(s.lang);send('language',{language:s.lang});if(s.open&&s.target){const key=JSON.stringify(s.target);if(lastTarget.current!==key){send('open-content',s.target);lastTarget.current=key;}}};
 useEffect(()=>{if(open)setStarted(true);if(ready)sync();},[open,target,lang,ready]);
 useEffect(()=>{const listener=e=>{if(!isExplorerMessage(e,frame.current?.contentWindow,location.origin))return;const data=e.data;if(data.type==='ready'){languageSync.current.ready=true;setReady(true);setFailed(false);sync();}if(!latest.current.open)return;if(data.type==='close')latest.current.onClose();if(data.type==='scene')latest.current.onScene?.(data.scene);if(data.type==='state')latest.current.onSection?.(data.section);if(data.type==='interaction')latest.current.onInteraction();if(data.type==='language'&&languageSync.current.accept(data.language)&&data.language!==latest.current.lang)latest.current.onLanguage(data.language);};window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);},[]);
 useEffect(()=>{if(!started||ready)return;const t=setTimeout(()=>setFailed(true),15000);return()=>clearTimeout(t);},[started,ready,attempt]);
 useEffect(()=>{if(backRequest&&ready&&open)send('back');},[backRequest]);
 if(!started)return null;
 const url='/modules/product-explorer/index.html?embed=1&shell=showroom&parentOrigin='+encodeURIComponent(location.origin)+'&lang='+initialLanguage.current;
 return <div className="explorer-frame" hidden={!open} data-ready={ready}><iframe ref={frame} key={attempt} src={url} title={lang==='zh'?'品牌、品类与产品探索':'Brand, category and product explorer'} allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin"/>{!ready&&<div className="module-loading"><span className="loading-orbit"/><p>{failed?(lang==='zh'?'内容暂时无法打开':'Content could not load'):(lang==='zh'?'正在打开探索内容…':'Opening the collection…')}</p>{failed&&<button onClick={()=>{lastTarget.current=null;initialLanguage.current=latest.current.lang;languageSync.current.reset();setReady(false);setFailed(false);setAttempt(v=>v+1);}}>{lang==='zh'?'重新载入':'Retry'}</button>}<button onClick={onClose}>{lang==='zh'?'返回场景':'Return to scene'}</button></div>}</div>;
}
