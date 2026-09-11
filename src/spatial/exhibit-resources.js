import * as T from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { loadResources, webUrl } from './resource-client.js';

// Read the original vector paths directly so viewBox-only SVGs stay sharp and visible.
function vectorRelief(svg,{w,h=w,color,unlit=false}) {
  const art=new T.Group();
  for(const path of new SVGLoader().parse(svg).paths) {
    const material=unlit
      ? new T.MeshBasicMaterial({color:color||path.color,toneMapped:false})
      : new T.MeshStandardMaterial({color:color||path.color,roughness:.35,metalness:.45});
    for(const shape of SVGLoader.createShapes(path)) {
      const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:4,bevelEnabled:true,bevelSize:.5,bevelThickness:.5,bevelSegments:2,curveSegments:8}),material);
      mesh.castShadow=true;art.add(mesh);
    }
  }
  const bounds=new T.Box3().setFromObject(art),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  const scale=Math.min(w/size.x,h/size.y);
  for(const child of art.children)child.position.sub(center);
  art.scale.set(scale,-scale,scale);
  return art;
}

// A room owns its solid pictograms and partner imagery, including late-load cleanup.
export function createExhibitResources(root) {
  const icons=[],partners=[],lights=[];
  root.traverse(node=>{
    if(node.userData.icon)icons.push(node);
    if(node.userData.partnerReference)partners.push(node);
    if(node.userData.milestone)lights.push(node);
  });
  let disposed=false,time=0;
  const abort=new AbortController();
  for(const mount of icons) {
    const spec=mount.userData.icon;
    fetch(`/media/icons/${spec.name}-${spec.tone||'navy'}.svg`,{signal:abort.signal})
      .then(r=>{if(!r.ok)throw Error('Pictogram unavailable');return r.text();})
      .then(svg=>{
        if(disposed)return;
        const art=vectorRelief(svg,{w:spec.width||.45,color:spec.tone==='ivory'?'#f1e6d2':'#1c3448'});
        art.name='Solid library pictogram';mount.add(art);
      }).catch(()=>{if(!disposed)mount.userData.iconUnavailable=true;});
  }
  if(partners.length)loadResources(abort.signal).then(({data,config})=>{
    for(const mount of partners){
      const spec=mount.userData.partnerReference,p=data.partners.find(p=>p.id===spec.id);
      const url=p?.logo&&webUrl(p.logo,webUrl(config.content.resourcesUrl));if(!url)continue;
      const install=art=>{
        art.name='Official partner image · '+p.id;art.position.z=.012;
        mount.children.forEach(child=>{if(child.userData.sign)child.visible=false;});mount.add(art);
      };
      if(new URL(url).pathname.toLowerCase().endsWith('.svg')) {
        fetch(url,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('Partner vector unavailable');return r.text();})
          .then(svg=>{if(!disposed)install(vectorRelief(svg,{w:spec.w,h:spec.h,unlit:true}));})
          .catch(()=>{if(!disposed)mount.userData.partnerImageUnavailable=true;});
        continue;
      }
      new T.TextureLoader().load(url,texture=>{
        if(disposed){texture.dispose();return;}
        texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
        const ratio=texture.image.width/texture.image.height,w=Math.min(spec.w,spec.h*ratio),h=w/ratio;
        const photo=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false}));
        install(photo);
      },undefined,()=>{if(!disposed)mount.userData.partnerImageUnavailable=true;});
    }
  }).catch(()=>{if(!disposed)root.userData.partnerImagesUnavailable=true;});
  const windows=[];
  for(const node of lights){
    const s=node.userData.milestone;
    for(let y=.2;y<s.height-.05;y+=.13){
      const pane=new T.Mesh(new T.PlaneGeometry(.067,.063),new T.MeshBasicMaterial({color:'#e9c587',transparent:true,opacity:.5}));
      pane.position.set(-.045,y,s.depth/2+.016);pane.name='Milestone window light';node.add(pane);
      windows.push({pane,index:s.index,phase:y/s.height});
    }
  }
  return {
    update(dt,{paused=false,reducedMotion=false,point}={}){
      if(disposed||paused||!windows.length)return false;
      if(!reducedMotion)time+=Math.min(Math.max(dt,0),.05);
      let changed=false;
      for(const w of windows){
        const opacity=reducedMotion?.55:.4+(point==='story'?.3:.09)*Math.pow(.5+.5*Math.sin(time*.9-w.phase*3-w.index*.42),2);
        changed ||= w.pane.material.opacity !== opacity;
        w.pane.material.opacity=opacity;
      }
      return changed;
    },
    dispose(){disposed=true;abort.abort();}
  };
}
