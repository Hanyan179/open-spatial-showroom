// Paths resolve relative to the module, including when mounted below another app.
export const asset = path => new URL(path.replace(/^\//,''), new URL('.', document.baseURI)).href;
export async function loadContent(){
 const [catalog,official,domains,concepts,media,variants]=await Promise.all(['catalog','official-content','domains','concepts','explorer-media','product-skus'].map(async file=>{const r=await fetch(asset(`shared/${file}.json`));if(!r.ok)throw Error(`Content unavailable: ${file}`);return r.json();}));
 if (!Array.isArray(catalog.categories) || !catalog.categories.length || !Array.isArray(catalog.subcategories) || !Array.isArray(official.brands)) throw Error('Content requires categories, subcategories and a brands array (which may be empty)');
 return {catalog,brands:official.brands,domains:domains.domains,items:concepts.items,media:media.items,skus:variants.items};
}
export const hasModel=(media)=>Boolean(media?.model);
export function availableViews(media){return [media?.model&&'model',media?.images?.length&&'photos',media?.video&&'video'].filter(Boolean);}
export function presentation(media,saved={}){const views=availableViews(media);return {...saved,mode:views.includes(saved.mode)?saved.mode:views.includes(media?.default)?media.default:views[0],photo:Math.max(0,Math.min(saved.photo||0,(media?.images?.length||1)-1))};}
export const contentText = (value, lang = 'zh') => typeof value === 'string' ? value : Array.isArray(value) ? value[lang === 'en' ? 1 : 0] || value[0] || '' : value?.[lang] || value?.zh || value?.en || '';
