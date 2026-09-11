import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

// Dynamic pivots remain real scene nodes. Batch their geometry in local space,
// then batch the building separately, retaining all content actions and mounts.
export function batchScene(root){
 root.updateMatrixWorld(true);const domains=[root];root.traverse(o=>{if(o!==root&&(o.userData.ambient||o.userData.inspect))domains.push(o);});
 let count=0;
 for(const domain of domains){
  const inverse=new T.Matrix4().copy(domain.matrixWorld).invert(),batches=new Map(),remove=[];
  domain.traverse(o=>{if(!o.isMesh)return;let owner=o;while(owner!==root&&!owner.userData.ambient&&!owner.userData.inspect)owner=owner.parent;if(owner!==domain)return;
   let parent=o,action;while(parent){if(parent.userData.action){action=parent.userData.action;break;}parent=parent.parent;}
   const key=o.material.uuid+JSON.stringify(action||null);if(!batches.has(key))batches.set(key,{material:o.material,action,geometries:[]});
   const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));batches.get(key).geometries.push(geo);remove.push(o);
  });
  remove.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
  for(const {material,action,geometries} of batches.values()){const merged=mergeGeometries(geometries);const geo=merged&&mergeVertices(merged);merged?.dispose();if(!geo)throw Error('Incompatible geometry attributes');const mesh=new T.Mesh(geo,material);mesh.castShadow=material.name!=='glass';mesh.receiveShadow=true;if(action)mesh.userData.action=action;domain.add(mesh);geometries.forEach(g=>g.dispose());count++;}
 }
 return count;
}
