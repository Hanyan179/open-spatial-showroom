import * as T from 'three';
// Local contact shade stays attached to the furniture. It is not a scene backdrop.
export function createContactShadows(root){
 const mounts=[];root.traverse(o=>{if(o.userData.contactShadow)mounts.push(o);});
 const objects=[];
 for(const mount of mounts){const {width,depth,ellipse=false}=mount.userData.contactShadow;
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,uniforms:{elliptical:{value:ellipse?1:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float elliptical;void main(){vec2 q=abs(vUv-.5)*2.;float r=mix(max(q.x,q.y),length(q),elliptical);float a=(1.-smoothstep(.52,1.,r))*.19;gl_FragColor=vec4(.09,.12,.14,a);#include <colorspace_fragment>\n}'});
  // Shader includes must begin on their own line.
  m.fragmentShader=m.fragmentShader.replace(';#include',';\n#include');
  const plane=new T.Mesh(new T.PlaneGeometry(width*1.18,depth*1.18),m);plane.name='Furniture contact shade';plane.rotation.x=-Math.PI/2;plane.position.y=.028;plane.userData.decorative=true;plane.raycast=()=>{};mount.add(plane);objects.push(plane);
 }
 return {dispose(){for(const o of objects){o.removeFromParent();o.geometry.dispose();o.material.dispose();}}};
}
