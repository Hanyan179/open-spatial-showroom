import { useEffect, useRef, useState } from 'react';
import { SCENES } from './catalog.js';
import { createSpatialEngine } from './engine/create-spatial-engine.js';
export default function SpatialWorld({
  target,
  paused,
  ambientEnabled = true,
  quality = 'clear',
  onStats,
  lang,
  market,
  onArrival,
  onStage,
  onReady,
  onError,
  onAction,
  onRecover,
  positions
}) {
  const host = useRef(),
    engine = useRef(),
    latest = useRef();
  latest.current = {
    paused, quality, onStats,
    ambientEnabled,
    lang,
    market,
    onArrival,
    onStage,
    onReady,
    onError,
    onAction,
    onRecover,
    target
  };
  const [error, setError] = useState(null),
    [flightInfo, setFlightInfo] = useState(null);
  useEffect(() => {
    const instance = createSpatialEngine(host.current, {
      getState: () => latest.current,
      positions: positions.current,
      setError,
      setFlightInfo
    });
    engine.current = instance;
    return () => {
      instance.dispose();
      engine.current = null;
    };
  }, []);
  const requested = useRef(target.request);
  useEffect(() => {
    if (requested.current === target.request) return;
    requested.current = target.request;
    engine.current?.request(target);
  }, [target.request]);
  return <div className="spatial-canvas" ref={host} aria-label={lang === 'zh' ? '三维交互空间' : 'Interactive 3D space'}><div className="transition-veil" />{flightInfo && <div className="flight-caption" role="status"><small>{lang === 'zh' ? '全球航线 · 连接每一种能力' : 'GLOBAL CONNECTIONS'}</small><h2>{SCENES[flightInfo.from]?.name[lang === 'zh' ? 0 : 1].split(' · ')[0]}<span>→</span>{SCENES[flightInfo.to]?.name[lang === 'zh' ? 0 : 1].split(' · ')[0]}</h2><p>{lang === 'zh' ? '从全球视野，抵达当地。' : 'From a global perspective to a local connection.'}</p></div>}{error && <div className="spatial-error" role="alert"><h2>{error === 'graphics' ? lang === 'zh' ? '需要启用三维图形加速' : '3D acceleration is required' : lang === 'zh' ? '这个空间暂时未能载入' : 'This space could not load'}</h2><p>{lang === 'zh' ? '可以重新载入，或返回刚才的空间继续参观。' : 'Retry, or return to the previous space.'}</p><button onClick={() => error === 'graphics' ? location.reload() : engine.current?.retry()}>{lang === 'zh' ? '重新载入' : 'Retry'}</button><button onClick={() => error === 'graphics' ? location.reload() : engine.current?.returnToRoom()}>{lang === 'zh' ? '返回原空间' : 'Return to previous space'}</button></div>}</div>;
}
