// Exhibition groupings map exact PRODUCT category labels; never infer from brands or titles.
const category = (id, domain, name, sourceCategories, point, wall) => ({ id, domain, name, sourceCategories, point, wall });
export const PRODUCT_CATEGORIES = [
  category('lip-care','beauty',['唇部护理','Lip care'],['Lip Repair','Lip Scrub','Lip Gloss','Lip Plumper','Lip Mask'],'lipstick'),
  category('bath','beauty',['沐浴护理','Bath care'],['Bath Bomb','Bath Salt','Bubble Bath'],'serum'),
  category('nail-art','beauty',['美甲装饰','Nail art'],['Nail Sticker','Nail Pen','Nail Sets'],'compact'),
  category('brushes','beauty',['化妆刷','Cosmetic brushes'],['Cosmetic Brushes'],'brushes',{ product: 'beauty-brush', shape: 'brushes', z: -1.3 }),
  category('sponges','beauty',['美妆海绵与粉扑','Sponges & powder puffs'],['Sponges - Cosmetic'],'sponges',{ product: 'beauty-sponge', shape: 'sponges', z: 1.7 }),
  category('board-games','play',['卡牌与桌游','Card & board games'],['Card&Board Games'],'rings'),
  category('creative-kits','play',['创意与拼搭','Creative & construction'],['Toy Kit','Construction Clay'],'maraca'),
  category('outdoor-play','play',['室内外探索','Indoor & outdoor play'],['Indoor & Outdoor Play'],'puzzle'),
  category('puzzles','play',['拼图','Puzzles'],['Puzzles'],'puzzles',{ product: 'play-australia-puzzle', shape: 'puzzles', z: -1.3 }),
  category('science','play',['科学探索套装','STEM kits'],['STEM Kit'],'science',{ product: 'play-metal-detector', shape: 'science', z: 1.7 }),
  category('balloons','party',['气球布置','Balloons'],['Balloons'],'balloon'),
  category('favours','party',['派对装饰与小物','Decor & favours'],['Party Decor/Favors'],'gift'),
  category('candles','party',['生日蜡烛','Birthday candles'],['Candle - Party'],'collection'),
  category('tableware','party',['纸质餐具','Paper tableware'],['Paper Tableware'],'tableware',{ product: 'party-cone-cups', shape: 'tableware', z: -1.3 }),
  category('napkins','party',['派对纸巾','Party napkins'],['Paper Napkins'],'napkins',{ product: 'party-napkins', shape: 'napkins', z: 1.7 })
];
export const categoriesFor = domain => PRODUCT_CATEGORIES.filter(c => c.domain === domain);
export const categoryById = id => PRODUCT_CATEGORIES.find(c => c.id === id);
export const categoryForProduct = p => categoriesFor(p?.domain).find(c => c.sourceCategories.includes(p.category));
export function productQuery(data, domain, category = 'all', query = '') {
  const q = query.trim().toLocaleLowerCase();
  return (data?.products || []).filter(p => p.domain === domain && (category === 'all' || categoryForProduct(p)?.id === category) && (!q || [p.title.zh,p.title.en,p.sourceName,p.sku,p.category].some(v => String(v || '').toLocaleLowerCase().includes(q))));
}
export function initialProductBrowse(data, domain, category, selectedId, memories = {}) {
  const scope = category || categoryForProduct(data?.products.find(p => p.id === selectedId))?.id || 'all';
  const saved = memories[domain + '/' + scope] || {};
  const rows = productQuery(data,domain,scope,saved.query || '');
  return { category: scope, query: saved.query || '', selected: rows.some(p=>p.id===saved.selected) ? saved.selected : rows.some(p=>p.id===selectedId) ? selectedId : rows[0]?.id, mode: saved.mode || 'list', scroll: saved.scroll || 0 };
}
