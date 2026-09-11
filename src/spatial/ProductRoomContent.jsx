import { sceneForDomain } from './core/scene-registry.js';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Minus, ArrowsCounterClockwise } from '@phosphor-icons/react';
import { loadRoomProducts, roomText } from './room-products.js';
import { categoriesFor, categoryById, categoryForProduct, productQuery, initialProductBrowse } from './core/product-categories.js';
import { webUrl } from './resource-client.js';
import './product-room-content.css';
export default function ProductRoomContent({
  domain,
  selectedId,
  category,
  lang,
  memory,
  backHandler,
  onVisit,
  onConcepts,
  onSelect
}) {
  const t = (zh, en) => lang === 'zh' ? zh : en,
    tx = v => roomText(v, lang);
  const [data, setData] = useState(null),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  const [browse, setBrowse] = useState({ category: category || 'all', query: '', mode: 'list', selected: selectedId });
  const listBox = useRef();
  useEffect(() => {
    if (!backHandler) return;
    const handler = () => { if (browse.mode !== 'detail') return false; setBrowse(v=>({...v,mode:'list'})); return true; };
    backHandler.current = handler;
    return () => { if (backHandler.current === handler) backHandler.current = null; };
  }, [backHandler,browse.mode]);
  useEffect(() => {
    if (data) setBrowse(initialProductBrowse(data,domain,category,selectedId,memory.current.browse));
  }, [data,domain,category]);
  useEffect(() => {
    if (!data) return;
    memory.current.browse ||= {};
    memory.current.browse[domain+'/'+browse.category] = browse;
  }, [data,browse,domain]);
  useEffect(() => { if (listBox.current) listBox.current.scrollTop = browse.scroll || 0; }, [browse.category,browse.mode]);
  const changeCategory = id => setBrowse(initialProductBrowse(data,domain,id,undefined,memory.current.browse));
  const chooseProduct = p => { setBrowse(v=>({...v,mode:'detail',selected:p.id})); onSelect(p.id); };
  const [imageError, setImageError] = useState(false),
    [view, setView] = useState(() => memory.current.views[selectedId || memory.current.selected[domain]] || {
      zoom: 1,
      pan: [0, 0]
    });
  const box = useRef(),
    drag = useRef();
  useEffect(() => {
    const ac = new AbortController();
    setError(false);
    loadRoomProducts(ac.signal).then(setData).catch(e => {
      if (!ac.signal.aborted) setError(true);
    });
    return () => ac.abort();
  }, [retry]);
  const items = productQuery(data,domain,browse.category,browse.query),
    item = items.find(p => p.id === browse.selected) || items[0],
    activeCategory = categoryById(browse.category),
    categoryName = activeCategory ? t(...activeCategory.name) : t('全部产品','All products');
  useEffect(() => {
    if (!item) return;
    memory.current.selected[domain] = item.id;
    setImageError(false);
    setView(memory.current.views[item.id] || {
      zoom: 1,
      pan: [0, 0]
    });
  }, [item?.id]);
  function changeView(next) {
    setView(next);
    if (item) memory.current.views[item.id] = next;
  }
  function zoom(delta) {
    changeView({
      zoom: Math.max(1, Math.min(3, view.zoom + delta)),
      pan: [0, 0]
    });
  }
  const external = (url, label) => webUrl(url) ? <a href={webUrl(url)} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight /></a> : null;
  return <section className={'room-products room-products-' + domain} data-product-id={browse.mode === 'detail' ? item?.id : undefined} data-category={browse.category} data-mode={browse.mode}>
  <aside className="room-product-nav"><span className="section-kicker">{t('展厅 · 产品分类', 'SHOWROOM · PRODUCT CATEGORIES')}</span><h1>{t(...(sceneForDomain(domain)?.productTitle || ['产品精选', 'Product selection']))}</h1>
   <nav aria-label={t('产品分类','Product categories')}>
    {[{id:'all',name:['全部产品','All products']},...categoriesFor(domain)].map(c=><button key={c.id} aria-pressed={browse.category===c.id} onClick={()=>changeCategory(c.id)}><div><strong>{t(...c.name)}</strong></div><span className="category-count">{productQuery(data,domain,c.id).length}</span></button>)}
   </nav><p className="category-count-note">{t('数量为展厅已接入资料。','Counts reflect the records available in this showroom.')}</p>
   <footer><button onClick={() => onConcepts(domain)}>{t('概念样品与档案', 'Concepts & archives')}<ArrowRight /></button></footer>
  </aside>
  {error ? <div className="product-feed-state" role="alert"><h2>{t('产品资料暂时未能载入', 'Product references could not load')}</h2><p>{t('可以重试，或关闭后继续参观。', 'Retry or close to continue your visit.')}</p><button onClick={() => setRetry(n => n + 1)}>{t('重新载入', 'Retry')}</button></div> : !data ? <div className="product-feed-state" role="status">{t('正在载入产品资料', 'Loading product references')}</div> : browse.mode === 'list' || !item ? <div className="product-category-results">
    <header><div><span className="section-kicker">{t('产品分类','PRODUCT CATEGORY')}</span><h2>{categoryName}</h2><p>{items.length} {t('条产品资料','product records')}</p></div><label className="product-category-search"><span>{t('搜索当前分类','Search this category')}</span><input type="search" aria-label={t('搜索当前分类','Search this category')} placeholder={t('名称或产品编号','Name or item number')} value={browse.query} onChange={e=>setBrowse(v=>({...v,query:e.target.value,scroll:0}))}/></label></header>
    <div className="category-product-list" ref={listBox} onScroll={e=>{const scroll=e.currentTarget.scrollTop;setBrowse(v=>({...v,scroll}));}}>
     {items.length ? items.map(p=><button className="category-product-row" key={p.id} data-product-id={p.id} onClick={()=>chooseProduct(p)}><img src={p.image} alt="" loading="lazy"/><div><small>{t(...(categoryForProduct(p)?.name || ['产品','Product']))}</small><h3>{tx(p.title)}</h3><span>{p.sku}</span></div><span>{t('查看详情','View details')}<ArrowRight/></span></button>) : <div className="product-feed-state"><h3>{browse.query ? t('没有符合搜索条件的产品','No matching products') : t('这一分类暂未接入产品资料','No records have been added to this category yet')}</h3>{browse.query && <button onClick={()=>setBrowse(v=>({...v,query:''}))}>{t('清除搜索','Clear search')}</button>}</div>}
    </div>
    <footer>{t('按分类浏览，点击查看图片与说明。','Browse by category. Choose a product for images and details.')}</footer>
  </div> : <>
   <div className="room-product-visual"><header><button className="back-category" onClick={()=>setBrowse(v=>({...v,mode:'list'}))}>← {t('返回','Back to ')}{categoryName}</button><span>{tx(item.imageKind)}</span><small>{t('原图比例 · 可放大查看', 'Original proportions · Zoom to explore')}</small></header>
    <div ref={box} className={'product-image-stage ' + (view.zoom > 1 ? 'zoomed' : '')} onPointerDown={e => {
          if (view.zoom <= 1) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            pan: view.pan
          };
        }} onPointerMove={e => {
          if (drag.current?.id !== e.pointerId) return;
          const rect = box.current.getBoundingClientRect(),
            lx = rect.width * (view.zoom - 1) / 2,
            ly = rect.height * (view.zoom - 1) / 2;
          changeView({
            zoom: view.zoom,
            pan: [Math.max(-lx, Math.min(lx, drag.current.pan[0] + e.clientX - drag.current.x)), Math.max(-ly, Math.min(ly, drag.current.pan[1] + e.clientY - drag.current.y))]
          });
        }} onPointerUp={() => drag.current = null} onPointerCancel={() => drag.current = null}>
     {imageError ? <div className="product-feed-state" role="alert"><p>{t('这张资料图暂时无法显示。', 'This reference image is unavailable.')}</p>{external(item.sourceUrl, t('在产品平台查看', 'View on the product platform'))}</div> : <img key={item.id} src={webUrl(item.image) || undefined} alt={tx(item.title) + ' · ' + tx(item.imageKind)} draggable="false" onError={() => setImageError(true)} style={{
            transform: `translate(${view.pan[0]}px,${view.pan[1]}px) scale(${view.zoom})`
          }} />}
    </div>
    <div className="product-zoom"><button aria-label={t('缩小产品图', 'Zoom out product image')} disabled={view.zoom <= 1} onClick={() => zoom(-.5)}><Minus /></button><span>{Math.round(view.zoom * 100)}%</span><button aria-label={t('放大产品图', 'Zoom in product image')} disabled={view.zoom >= 3} onClick={() => zoom(.5)}><Plus /></button><button aria-label={t('还原产品图', 'Reset product image')} onClick={() => changeView({
            zoom: 1,
            pan: [0, 0]
          })}><ArrowsCounterClockwise /></button><small>{view.zoom > 1 ? t('拖动查看细节', 'Drag to inspect') : t('点按 + 查看细节', 'Tap + for details')}</small></div>
    <p className="product-image-credit">{tx(item.imageCredit) || t('图片按原始比例展示。素材类型见上方标注。', 'Images retain their original proportions. See the media type above.')}</p>
   </div>
   <article className="room-product-details"><span className="section-kicker">{t(...(categoryForProduct(item)?.name || ['产品','Product']))}</span><h2>{tx(item.title)}</h2><p className="product-original-name">{item.sourceName}</p>
    <dl><div><dt>{t('产品编号', 'Item number')}</dt><dd>{item.sku}</dd></div><div><dt>{t('资料品类', 'Source category')}</dt><dd>{item.category}</dd></div>{item.brand && <div><dt>{t('资料品牌', 'Source brand')}</dt><dd>{item.brand}</dd></div>}</dl>
    <p>{tx(item.description)}</p><section className="product-scene-note"><h3>{t('在这个房间里', 'In this room')}</h3><p>{tx(item.sceneNote)}</p><button onClick={() => onVisit(domain, item.point)}>{t('前往这个展位', 'Visit this exhibit')}<ArrowRight /></button></section>
    <div className="product-source-action">{external(item.sourceUrl, t('打开完整产品资料', 'Open full product record'))}{item.sourceUrl&&<small>{t('在新窗口打开来源资料。', 'Open source details in a new window.')}</small>}</div>
    <p className="product-truth-note">{t('三维展品为依据产品类型制作的场景示意。品牌字段按来源记录展示，不据此推定品牌归属或产品规格。', 'The 3D exhibits are scene interpretations based on product types. Source brand labels do not establish ownership or specifications.')}</p>
   </article>
  </>}
 </section>;
}
