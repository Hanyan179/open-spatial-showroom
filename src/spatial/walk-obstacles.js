import * as T from 'three';
// Bake furniture footprints before draw-call batching merges distant objects.
export function walkObstacles(root){
 root.updateMatrixWorld(true);const boxes=[];
 root.traverse(o=>{
  if(o.isMesh&&!o.material.transparent){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(b.max.y>.18&&b.min.y<2.2)boxes.push([b.min.x,b.min.z,b.max.x,b.max.z]);}
  if(o.userData.sample){const p=o.getWorldPosition(new T.Vector3()),h=o.userData.sample.height;boxes.push([p.x-h/2,p.z-h/2,p.x+h/2,p.z+h/2]);}
 });
 // Keep conservative outer bounds; tiny precision changes must not erode clearance.
 return boxes.map(b=>b.map((v,i)=>(i<2?Math.floor(v*1000):Math.ceil(v*1000))/1000));
}
