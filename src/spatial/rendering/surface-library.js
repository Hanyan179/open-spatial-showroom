import * as T from 'three';
const families={wood:'wood',oak:'wood',fabric:'woven',linen:'woven',sage:'woven',stone:'limestone',ivory:'porcelain',plaster:'plaster',brass:'metal',steel:'metal'};
const TAU=Math.PI*2;
const lattice=(x,y,n)=>{const h=Math.sin(((x%n+n)%n)*127.1+((y%n+n)%n)*311.7)*43758.5453;return h-Math.floor(h);};
function noise(u,v,n=64){const x=u*n,y=v*n,ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const a=lattice(ix,iy,n),b=lattice(ix+1,iy,n),c=lattice(ix,iy+1,n),d=lattice(ix+1,iy+1,n);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;}

// Tileable authored microstructure. All distances are in metres, with UVs baked before batching.
export function surfaceSample(family,u,v) {
  const a=Math.sin(TAU*(u*7+v*11)),b=Math.sin(TAU*(u*23-v*19));
  if(family==='wood') { const grain=Math.sin(TAU*u*21+Math.sin(TAU*v*2)*.7+Math.sin(TAU*v*5)*.18);const pore=Math.pow(.5+.5*Math.sin(TAU*u*63+Math.sin(TAU*v*3)),12);return {height:.5+.12*grain+.05*b,tint:.94+.028*grain-.035*pore,rough:.67+.08*pore}; }
  if(family==='woven') { const warp=Math.sin(TAU*u*96),weft=Math.sin(TAU*v*96);return {height:.5+.17*warp+.17*weft,tint:.94+.035*warp*weft,rough:.94}; }
  if(family==='limestone') { const vein=Math.exp(-Math.pow(Math.sin(TAU*(u*2+v)+Math.sin(TAU*v*3)*.3)*13,2));return {height:.5+.03*(noise(u,v)-.5),tint:.98-.023*vein,rough:.78+.04*(noise(u,v)-.5)}; }
  if(family==='metal')return {height:.5+.055*Math.sin(TAU*v*173),tint:1,rough:.7+.12*Math.sin(TAU*v*173)};
  const grain=noise(u,v,96)-.5;return {height:.5+.025*grain,tint:.993+.012*grain,rough:family==='porcelain'?.73:.95};
}
export function createSurfaceLibrary() {
  const textures=new Map();
  function maps(family) {
    if(textures.has(family)) return textures.get(family);
    const size=512,colour=new Uint8Array(size*size*4),normal=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x/size,v=y/size,s=surfaceSample(family,u,v),i=(y*size+x)*4;
      const dx=(surfaceSample(family,u+1/size,v).height-surfaceSample(family,u-1/size,v).height)*.7;
      const dy=(surfaceSample(family,u,v+1/size).height-surfaceSample(family,u,v-1/size).height)*.7;
      const len=Math.hypot(dx,dy,1);colour.set([s.tint*255,s.tint*255,s.tint*255,255],i);rough.set([s.rough*255,s.rough*255,s.rough*255,255],i);normal.set([(1-dx/len)*127.5,(1-dy/len)*127.5,(1+1/len)*127.5,255],i);
    }
    const texture=(data,srgb=false)=>{const t=new T.DataTexture(data,size,size,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=8;t.needsUpdate=true;t.userData.surfaceOwned=true;return t;};
    const set={map:texture(colour,true),normalMap:texture(normal),roughnessMap:texture(rough)};textures.set(family,set);return set;
  }
  return {
    apply(material){const f=families[material.name];if(!f)return;Object.assign(material,maps(f));material.normalScale?.setScalar(f==='woven'?.38:f==='metal'?.06:.32);material.needsUpdate=true;},
    setQuality(anisotropy){for(const set of textures.values())for(const t of Object.values(set))if(t.anisotropy!==anisotropy){t.anisotropy=anisotropy;t.needsUpdate=true;}},
    dispose(){for(const set of textures.values())for(const t of Object.values(set))t.dispose();textures.clear();}
  };
}
// Box UVs are projected in local metres. Scaling the room never stretches a single tile across a wall.
export function metricBoxUV(geometry,name) {
  if(!families[name])return geometry;
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
  const repeat=name==='fabric'||name==='linen'||name==='sage'?2:name==='wood'||name==='oak'?1.3:.65;
  for(let i=0;i<p.count;i++) {
    const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));
    const u=x>y&&x>z?p.getZ(i):p.getX(i),v=y>x&&y>z?p.getZ(i):p.getY(i);
    uv.setXY(i,u*repeat,v*repeat);
  }
  return geometry;
}
