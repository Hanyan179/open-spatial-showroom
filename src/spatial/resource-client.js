// Runtime URLs keep hosting, content feeds and the 3D scene independent.
// Replacing a feed with an API does not require rebuilding scene models.
export function webUrl(value,base=globalThis.location?.href||'http://localhost/'){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,base);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
let configuration;
export async function fetchJson(url,{timeoutMs=12000,credentials='same-origin',signal}={}){
 const safe=webUrl(url);if(!safe)throw Error('Invalid content URL');
 const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
 const timer=setTimeout(abort,timeoutMs);
 try{const response=await fetch(safe,{signal:controller.signal,credentials,cache:'no-cache'});if(!response.ok)throw Error(`Content HTTP ${response.status}`);return await response.json();}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export function loadConfiguration(){
 configuration??=fetchJson('/showroom.config.json').catch(error=>{configuration=null;throw error;});return configuration;
}
export async function loadCompany(){const config=await loadConfiguration();return fetchJson(config.content.companyUrl,config.requests);}
export async function loadResources(signal){
 const config=await loadConfiguration(),data=await fetchJson(config.content.resourcesUrl,{...config.requests,signal});
 if(!Array.isArray(data.news)||!Array.isArray(data.partners))throw Error('Invalid resource feed');
 return {config,data};
}
