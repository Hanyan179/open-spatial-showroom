import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PRODUCT_CATEGORIES, categoriesFor, categoryForProduct, productQuery, initialProductBrowse } from '../src/spatial/core/product-categories.js';
import { SCENES, REGISTRY } from '../src/spatial/core/scene-registry.js';
import { resolveAction, hotspotDestination } from '../src/spatial/core/action-router.js';
import { contentLinkErrors } from '../src/spatial/core/content-links.js';
import { validateRoomProducts } from '../src/spatial/room-products.js';
const data=JSON.parse(await fs.readFile(new URL('../public/data/room-products.json',import.meta.url)));
test('source categories partition all records, and stands open different collections',()=>{
 for(const domain of ['beauty','play','party']) {
  const cats=categoriesFor(domain);assert.equal(cats.length,5);
  const rows=cats.flatMap(c=>productQuery(data,domain,c.id));
  assert.equal(new Set(rows.map(p=>p.id)).size,rows.length);
  assert.equal(rows.length,productQuery(data,domain).length);
  for(const c of cats){assert(productQuery(data,domain,c.id).length);const point=SCENES[domain].points.find(p=>p.id===c.point);assert.equal(point.action.category,c.id);assert.equal(resolveAction(point.action,domain).panel.category,c.id);assert.equal(hotspotDestination(point.action,domain,'overview').point,c.point);}
  assert.equal(cats.filter(c=>c.wall).length,2);
 }
 assert.deepEqual(productQuery(data,'beauty','bath').map(p=>p.sku),['DEMO-002','DEMO-016']);
 assert.equal(productQuery(data,'party','candles').length,2);
 assert.equal(productQuery(data,'play','creative-kits').length,2);
});
test('search stays in the active category and can match both languages and item numbers',()=>{
 assert.equal(productQuery(data,'beauty','lip-care','DEMO-002').length,0);
 assert.equal(productQuery(data,'beauty','bath','mini')[0].id,'beauty-mini-bath');
 assert.equal(productQuery(data,'beauty','bath','迷你')[0].id,'beauty-mini-bath');
 assert.equal(productQuery(data,'beauty','bath','DEMO-016')[0].id,'beauty-mini-bath');
 assert.equal(productQuery(data,'party','tableware','missing').length,0);
});
test('entry category overrides another category memory; reentry retains its own query and detail',()=>{
 const remembered={'beauty/bath':{query:'mini',selected:'beauty-mini-bath',mode:'detail',scroll:150}};
 const lip=initialProductBrowse(data,'beauty','lip-care','beauty-lip-balm',remembered);
 assert.equal(lip.mode,'list');assert.equal(lip.selected,'beauty-lip-balm');assert.equal(lip.query,'');
 const bath=initialProductBrowse(data,'beauty','bath','beauty-bath-star',remembered);
 assert.equal(bath.mode,'detail');assert.equal(bath.selected,'beauty-mini-bath');assert.equal(bath.scroll,150);
 assert.equal(initialProductBrowse(data,'beauty',undefined,'beauty-bath-star').category,'bath');
 assert.equal(initialProductBrowse(data,'beauty','all').category,'all');
});
test('mismatched product category, cross-room category and unknown source categories fail validation',()=>{
 assert(contentLinkErrors({type:'roomProducts',category:'bath',id:'beauty-lip-balm'},'beauty',REGISTRY,data.products).some(e=>e.includes('does not match')));
 assert(contentLinkErrors({type:'roomProducts',category:'tableware'},'beauty',REGISTRY,data.products).length);
 assert.throws(()=>validateRoomProducts({products:[{...data.products[0],category:'invented'}]}),/Unmapped/);
 for(const p of data.products)assert(categoryForProduct(p));
 assert.equal(new Set(PRODUCT_CATEGORIES.map(c=>c.id)).size,PRODUCT_CATEGORIES.length);
});
