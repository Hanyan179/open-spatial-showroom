import fs from 'node:fs/promises';
// Original vector illustrations; no downloaded product photography or logos.
const products=JSON.parse(await fs.readFile('public/data/room-products.json','utf8')).products;
const concepts=JSON.parse(await fs.readFile('vendor/explorer/public/shared/concepts.json','utf8')).items;
const palette={beauty:['#ebcec8','#c48e82'],play:['#dce6df','#719b90'],party:['#e2d8ec','#a28bb8']};
function illustration(kind,domain,variant=0){
 const [bg,ink]=palette[domain],gold='#b69a62';
 let art='';
 if(/balloon/.test(kind))art=`<ellipse cx="345" cy="235" rx="103" ry="135" fill="${ink}"/><ellipse cx="505" cy="215" rx="95" ry="123" fill="${gold}"/><path d="M345 370Q420 450 380 590M505 338Q450 450 440 590" fill="none" stroke="${gold}" stroke-width="5"/>`;
 else if(/candle|gift|blowout|napkin|cup/.test(kind))art=`<path d="M238 360h324v195H238z" fill="${ink}"/><path d="M219 333h362v49H219z" fill="${gold}"/><path d="M387 335v221" stroke="#f9f7ef" stroke-width="32"/><path d="M399 330C220 322 281 196 345 265L400 327C560 317 511 200 450 268Z" fill="none" stroke="${gold}" stroke-width="18"/>`;
 else if(/telescope|detector|puzzle|science/.test(kind))art=`<g transform="rotate(-16 400 300)"><rect x="224" y="243" width="325" height="91" rx="17" fill="${ink}"/><rect x="515" y="230" width="53" height="117" rx="14" fill="${gold}"/><ellipse cx="222" cy="288" rx="22" ry="43" fill="#294653"/></g><path d="M405 332V444M405 426L285 585M405 426L533 585M405 426V595" stroke="${gold}" stroke-width="15" fill="none"/>`;
 else if(domain==='play'||kind==='rings'||kind==='maraca')art=`<rect x="236" y="404" width="153" height="153" rx="28" fill="${ink}"/><rect x="405" y="403" width="153" height="153" rx="28" fill="${gold}"/><circle cx="397" cy="308" r="88" fill="#d6a19d"/><path d="M304 405L400 242L496 405Z" fill="#f3df9c" opacity=".8"/>`;
 else if(/nail|compact|sponge/.test(kind))art=`<ellipse cx="400" cy="523" rx="190" ry="49" fill="${gold}"/><rect x="215" y="284" width="370" height="245" rx="44" fill="${gold}"/><rect x="233" y="300" width="334" height="212" rx="28" fill="#f8f4ed"/>${[[287,355],[435,355],[287,445],[435,445]].map(([x,y],i)=>`<rect x="${x-24}" y="${y-27}" width="113" height="65" rx="16" fill="${[ink,'#bbaccc','#e1b3a6','#879c95'][i]}"/>`).join('')}`;
 else if(/star|bath/.test(kind))art=`<path d="M400 170L458 306L605 319L491 419L524 564L400 488L276 564L309 419L195 319L342 306Z" fill="${ink}" stroke="${gold}" stroke-width="9"/>`;
 else art=`<rect x="308" y="271" width="184" height="300" rx="32" fill="${ink}"/><rect x="322" y="184" width="156" height="104" rx="16" fill="${gold}"/><rect x="338" y="352" width="124" height="122" rx="7" fill="#f8f5ef"/><path d="M360 388H440M360 409H426M360 431H416" stroke="${ink}" stroke-width="7"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${bg}"/><circle cx="680" cy="130" r="180" fill="#fff" opacity=".22"/><ellipse cx="400" cy="603" rx="229" ry="27" fill="#243f49" opacity=".10"/><g transform="translate(${variant*7} ${variant*-6})">${art}</g><path d="M302 688H498" stroke="${gold}" stroke-width="2"/><text x="400" y="727" text-anchor="middle" font-family="sans-serif" font-size="18" letter-spacing="5" fill="#294653">CONCEPT ILLUSTRATION</text></svg>`;
}
await fs.mkdir('public/media/examples',{recursive:true});await fs.mkdir('vendor/explorer/public/studies',{recursive:true});
for(const p of products)await fs.writeFile(`public/media/examples/${p.id}.svg`,illustration(p.id,p.domain));
for(const p of concepts)for(let i=0;i<3;i++)await fs.writeFile(`vendor/explorer/public/studies/${p.id}-${i}.svg`,illustration(p.id,p.domain,i));
console.log(`Created ${products.length} product illustrations and ${concepts.length*3} concept illustrations.`);
