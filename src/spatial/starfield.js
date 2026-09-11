import * as T from 'three';

// A quiet, layered night sky. All buffers are reused; meteors never accumulate.
export function meteorPose(time,index=0){
 const cycle=29+index*8,elapsed=(time-7-index*12),iteration=Math.floor(elapsed/cycle),age=((elapsed%cycle)+cycle)%cycle,duration=2.8;
 const visible=elapsed>=0&&age<duration,p=age/duration;
 return {visible,opacity:visible?Math.sin(Math.PI*p)**.65*.7:0,x:(index?16:-38)+(iteration%3)*3+p*18,y:62-index*7-p*10};
}

export function createStarfield(scene){
 const root=new T.Group();root.name='Layered night sky with occasional meteors';scene.add(root);let time=0;
 const backdrop=new T.Mesh(new T.PlaneGeometry(260,160),new T.ShaderMaterial({depthWrite:false,fog:false,uniforms:{},vertexShader:'varying vec2 uv0; void main(){uv0=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 uv0;
 void main(){vec2 p=uv0-.5;float glow=exp(-length(p*vec2(2.2,3.8))*4.);float band=exp(-pow((p.y+p.x*.24)*6.,2.))*exp(-abs(p.x)*3.);vec3 c=vec3(.002,.007,.017)+vec3(.009,.032,.048)*glow+vec3(.006,.008,.018)*band;gl_FragColor=vec4(c,1.);}` }));
 backdrop.position.set(0,55,-105);root.add(backdrop);
 let seed=731;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;},pos=[],variation=[];
 for(let i=0;i<1800;i++){pos.push((rand()-.5)*185,55+(rand()-.5)*105,-52-rand()*40);variation.push(rand(),rand(),rand());}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));geometry.setAttribute('variation',new T.Float32BufferAttribute(variation,3));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending,uniforms:{time:{value:0},scale:{value:1}},vertexShader:`attribute vec3 variation; varying vec3 v; uniform float time;uniform float scale;
 void main(){v=variation;vec3 p=position; p.x+=sin(time*.014+variation.x*6.28)*.16;p.y+=cos(time*.011+variation.x*6.28)*.09;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.2+variation.y*2.2)*scale;}`,fragmentShader:`varying vec3 v;uniform float time;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=pow(1.-d,1.6)*(.5+.22*sin(time*(.35+v.z*.4)+v.x*6.28));vec3 c=mix(vec3(.57,.72,1.),vec3(1.,.84,.63),v.x);gl_FragColor=vec4(c,a);}`});
 root.add(new T.Points(geometry,material));
 const meteors=Array.from({length:2},(_,index)=>{
  const positions=[],colours=[],segments=18,length=6,dir=new T.Vector3(18,-10,0).normalize(),perp=new T.Vector3(-dir.y,dir.x,0);
  const point=(u,side)=>dir.clone().multiplyScalar(-length*u).addScaledVector(perp,side*.024*(1-u));
  for(let i=0;i<segments;i++){const a=i/segments,b=(i+1)/segments;for(const [u,side] of [[a,-1],[b,-1],[a,1],[a,1],[b,-1],[b,1]]){positions.push(...point(u,side).toArray());const gain=(1-u)**2;colours.push(.6*gain,.79*gain,gain);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colours,3));const mesh=new T.Mesh(geo,new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,toneMapped:false}));mesh.position.z=-55-index*9;mesh.visible=false;root.add(mesh);return mesh;
 });
 return {group:root,time:()=>time,update(dt,{reducedMotion=false}={}){if(!reducedMotion)time+=Math.min(Math.max(dt,0),.05);material.uniforms.time.value=reducedMotion?0:time;material.uniforms.scale.value=Math.min(2,Math.max(1,(globalThis.innerHeight||1080)/1080));meteors.forEach((mesh,i)=>{const p=meteorPose(time,i);mesh.visible=!reducedMotion&&p.visible;mesh.position.x=p.x;mesh.position.y=p.y;mesh.material.opacity=p.opacity;});return meteors.some(m=>m.visible);}};
}
