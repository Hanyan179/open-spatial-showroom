import { PRODUCT_DOMAINS } from './core/scene-registry.js';
import { localized } from './core/i18n.js';
import { categoryForProduct } from './core/product-categories.js';
import { fetchJson, loadConfiguration, webUrl } from './resource-client.js';
export const roomText = localized;
export function validateRoomProducts(data, base) {
  if (!Array.isArray(data?.products)) throw Error('Invalid product selection');
  const ids = new Set();
  for (const p of data.products) {
    if (!p.id || ids.has(p.id) || !PRODUCT_DOMAINS.includes(p.domain) || !p.title?.zh || !p.title?.en || (p.sourceUrl != null && !webUrl(p.sourceUrl, base)) || !webUrl(p.image, base) || !p.sku) throw Error('Invalid product reference');
    ids.add(p.id);
    if (!categoryForProduct(p)) throw Error(`Unmapped source category: ${p.domain}/${p.category}`);
  }
  return {
    ...data,
    products: data.products.map(p => ({
      ...p,
      sourceUrl: webUrl(p.sourceUrl, base),
      image: webUrl(p.image, base)
    })),
    related: Object.fromEntries(Object.entries(data.related || {}).map(([domain, rows]) => [domain, rows.map(p => {
      const url = webUrl(p.sourceUrl, base);
      if (!url) throw Error('Invalid related product URL');
      return {
        ...p,
        sourceUrl: url
      };
    })]))
  };
}
export async function loadRoomProducts(signal) {
  const config = await loadConfiguration(),
    url = webUrl(config.content.roomProductsUrl);
  return validateRoomProducts(await fetchJson(url, {
    ...config.requests,
    signal
  }), url);
}
