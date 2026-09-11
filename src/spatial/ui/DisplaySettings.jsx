import { ArrowsOut, Sparkle } from '@phosphor-icons/react';
import { useShowroom } from '../host/ShowroomProvider.jsx';
import { QUALITY_PROFILES } from '../core/render-quality.js';
import './display-settings.css';
export default function DisplaySettings(){
 const {preferences:{quality,setQuality,renderStats,ambientEnabled,toggleAmbient},commands:{fullscreen},t,tx}=useShowroom();
 const s=renderStats;
 return <section className="display-settings" aria-label={t('展示设置','Display settings')}>
  <header><span className="section-kicker">{t('画面与运行','PICTURE & PERFORMANCE')}</span><h2>{t('为这块屏幕，选择合适画质','Choose the picture for this screen')}</h2><p>{t('立即生效，保留当前房间与参观位置。','Applied immediately, preserving your room and viewpoint.')}</p></header>
  <div className="quality-options" role="group" aria-label={t('画质','Picture quality')}>{QUALITY_PROFILES.map(p=><button key={p.id} aria-pressed={quality===p.id} onClick={()=>setQuality(p.id)}><strong>{tx(p.name)}</strong><span>{tx(p.description)}</span></button>)}</div>
  <div className="display-toggles"><button onClick={fullscreen}><ArrowsOut/>{t('全屏展示','Fullscreen')}</button><button aria-pressed={ambientEnabled} onClick={toggleAmbient}><Sparkle/>{t('场景微动','Ambient motion')} · {ambientEnabled?t('开','On'):t('关','Off')}</button></div>
  <section className="display-controls"><h3>{t('大屏怎么操作','Controlling the display')}</h3><p>{t('触摸屏：点选光点自动走近；拖动可转头，带旋转提示的展品可直接拖动。普通大屏：把无线鼠标、触控板或键盘连接到展示电脑。','Touch: tap a marker to approach; drag to look around or rotate exhibits labelled for rotation. Standard display: connect a mouse, trackpad or keyboard to the display computer.')}</p><dl><div><dt>← / → · Page Up / Down</dt><dd>{t('上一站 / 下一站','Previous / next stop')}</dd></div><div><dt>Enter</dt><dd>{t('查看当前展区；有按钮焦点时操作该按钮','Explore this stop, or activate the focused button')}</dd></div><div><dt>P · Space</dt><dd>{t('暂停 / 继续巡游','Pause / resume the tour')}</dd></div><div><dt>M · Esc</dt><dd>{t('打开电梯 / 返回','Open elevator / go back')}</dd></div></dl><small>{t('页面需处于焦点中。输入、详情和媒体使用自己的按键；普通按钮可用 Tab 选择。支持翻页键的演示器可用于逐站讲解，具体按键需在设备上确认。手机遥控尚未接入。','The page must have focus. Forms, details and media keep their own keys; use Tab to select buttons. Presenters that send page keys can advance the visit; verify the device mapping. Phone remote control is not connected.')}</small></section>
  <section className="display-readout"><h3>{t('本机绘制状态','Rendering on this computer')}</h3><dl><div><dt>{t('实际绘制尺寸','Drawing resolution')}</dt><dd>{s?`${s.width} × ${s.height}`:'—'}</dd></div><div><dt>{t('最近场景帧率','Recent scene frame rate')}</dt><dd>{s?.fps?`${s.fps} ${t('帧 / 秒','fps')}`:t('等待场景采样','Awaiting scene sample')}</dd></div><div><dt>{t('运行位置','Rendered by')}</dt><dd>{t('本机浏览器','This browser')}</dd></div></dl><p>{t('打开目录或详情时停止背景绘制；关闭后继续。帧率为最近一次场景采样。','Background rendering pauses for menus and details. The frame rate is the latest scene sample.')}</p></section>
  <p className="display-tip">{t('若移动不流畅，可切换流畅模式。清晰度也受屏幕输出设置与产品原图分辨率影响。','If movement slows, choose Smooth. Display output settings and source-image resolution also affect sharpness.')}</p>
 </section>;
}
