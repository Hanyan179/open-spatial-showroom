import * as T from 'three';
import {loadRoomProducts} from './room-products.js';
// Flat source photographs live on small product labels, never as room backdrops.
export function createProductReferences(root){
 const mounts=[];root.traverse(o=>{if(o.userData.productReference)mounts.push(o);});if(!mounts.length)return {dispose(){}};
 let disposed=false;const abort=new AbortController(),loader=new T.TextureLoader();
 loadRoomProducts(abort.signal).then(data=>{
  for(const mount of mounts){const spec=mount.userData.productReference,p=data.products.find(p=>p.id===spec.id);if(!p)continue;
   loader.load(p.image,texture=>{if(disposed){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;const ratio=texture.image.width/texture.image.height,w=Math.min(spec.w,spec.h*ratio),h=w/ratio;
    const photo=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,toneMapped:false}));photo.name='PRODUCT reference · '+p.sku;mount.add(photo);
   },undefined,()=>{mount.userData.referenceUnavailable=true;});
  }
 }).catch(()=>{if(!disposed)root.userData.productReferencesUnavailable=true;});
 return {dispose(){disposed=true;abort.abort();}};
}
