import * as T from 'three';
import { metricBoxUV } from './rendering/surface-library.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function workshop(){
 const root=new T.Group(),materials=new Map();
 const colours={steel:'#9baeb5',rubber:'#303e49',plaster:'#eee9df',stone:'#d9d0bd',ivory:'#eee4d1',navy:'#1c3448',blue:'#17324d',ink:'#162f42',brass:'#bc9870',wood:'#b79870',oak:'#d1b58a',fabric:'#d5ccba',linen:'#e9e2d5',sage:'#8b9e8e',leaf:'#617766',rose:'#cc9e92',blush:'#ead5c6',teal:'#78a6a1',lilac:'#b5aac9',yellow:'#d6b967',glass:'#bfd5d4',dark:'#394044',light:'#ffedcb',white:'#f6f3ea'};
 const material=(name)=>{if(materials.has(name))return materials.get(name);const color=colours[name]||name;const metal=['brass','steel'].includes(name),glass=name==='glass',light=name==='light',wood=['wood','oak'].includes(name),coated=['navy','blue'].includes(name);const m=light?new T.MeshBasicMaterial({color}):new T.MeshPhysicalMaterial({color,roughness:metal?.32:glass?.12:wood?.66:coated?.35:name==='stone'?.6:.76,metalness:metal?.88:coated?.18:0,clearcoat:coated?.3:wood?.12:0,clearcoatRoughness:.32,transparent:glass,opacity:glass?.09:1,side:glass||name==='leaf'?T.DoubleSide:T.FrontSide,depthWrite:!glass});m.name=name;materials.set(name,m);return m;};
 const group=(name,parent=root,p=[0,0,0])=>{const g=new T.Group();g.name=name;g.position.set(...p);parent.add(g);return g;};
 const mesh=(parent,geometry,mat,p=[0,0,0],rotation=[0,0,0])=>{const o=new T.Mesh(geometry,typeof mat==='string'?material(mat):mat);o.position.set(...p);o.rotation.set(...rotation);o.castShadow=mat!=='glass'&&mat!=='light';o.receiveShadow=true;parent.add(o);return o;};
 const box=(g,size,mat,p,r=.025)=>mesh(g,metricBoxUV(r?new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(s=>s*.4))):new T.BoxGeometry(...size),typeof mat==='string'?mat:mat.name),mat,p);
 const cylinder=(g,r,h,mat,p,top=r)=>mesh(g,new T.CylinderGeometry(top,r,h,48),mat,p);
 const sphere=(g,r,mat,p,scale=[1,1,1])=>{const o=mesh(g,new T.SphereGeometry(r,mat==='leaf'||mat==='sage'?8:28,mat==='leaf'||mat==='sage'?6:16),mat,p);o.scale.set(...scale);return o;};
 const tube=(g,points,r,mat)=>mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(16,points.length*8),r,8,false),mat);
 const ring=(g,r,t,mat,p,rot=[Math.PI/2,0,0])=>mesh(g,new T.TorusGeometry(r,t,10,64),mat,p,rot);
 const sign=(g,text,p,w=1.5,h=.3,opts={})=>{const mount=group('Typography · '+text[0],g,p);mount.userData.sign={text,w,h,...opts};return mount;};
 const target=(g,action)=>{g.userData.action=action;return g;};
 const books=(g,p,count=6)=>{const b=group('Bound books',g,p);for(let i=0;i<count;i++){const width=.08+(i%3)*.015,height=.24+(i%4)*.035;box(b,[width,height,.24],['navy','fabric','wood','sage'][i%4],[i*.105,height/2,0],.006);box(b,[width*.7,height-.03,.22],'ivory',[i*.105,height/2,.012],.003);for(let j=0;j<2;j++)box(b,[width*.72,.008,.008],'brass',[i*.105,.05+j*(height-.1),.125],.002);}return b;};
 const vase=(g,p,scale=1)=>{const a=group('Ceramic vessel',g,p);a.scale.setScalar(scale);const pts=[[0,0],[.12,0],[.21,.12],[.22,.25],[.15,.37],[.085,.44],[.09,.46]].map(p=>new T.Vector2(...p));const curve=new T.SplineCurve(pts);mesh(a,new T.LatheGeometry(curve.getPoints(40),48),'ivory');ring(a,.086,.007,'stone',[0,.46,0]);return a;};
 const leafGeometry=()=>{const p=[],uv=[],indices=[];for(let j=0;j<=8;j++){const t=j/8,w=Math.max(.0003,Math.sin(Math.PI*t)*.044);for(let k=0;k<3;k++){const u=k-1;p.push(u*w,(t-.5)*.24,Math.sin(Math.PI*t)*.018*(1-Math.abs(u))+.013*t*t);uv.push(k/2,t);}}for(let j=0;j<8;j++)for(let k=0;k<2;k++){const i=j*3+k;indices.push(i,i+1,i+3,i+1,i+4,i+3);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;};
 const plant=(g,p,scale=1)=>{const a=group('Olive tree with branching leaves',g,p);a.scale.setScalar(scale);cylinder(a,.27,.6,'stone',[0,.3,0],.36);cylinder(a,.3,.035,'dark',[0,.59,0]);cylinder(a,.024,1.9,'wood',[0,1.48,0],.013);const crown=group('Wind in the olive crown',a,[0,.7,0]);crown.userData.ambient={kind:'foliage',period:10+scale*2,phase:p[0]*.31+p[2]*.17,amplitude:.018};for(let i=0;i<16;i++){const angle=i*2.399,h=.85+i*.092,r=.31+(i%4)*.05;const x=Math.cos(angle)*r,z=Math.sin(angle)*r;tube(crown,[[0,h-.7,0],[x*.55,h-.47,z*.55],[x,h-.28,z]],.009,'wood');for(let j=0;j<5;j++){const leaf=mesh(crown,leafGeometry(),'leaf',[x+Math.cos(angle+j)*.12,h-.3+j*.05,z+Math.sin(angle+j)*.13]);leaf.rotation.set(.25,j,angle*.3);}}return a;};
 const chair=(g,p,rotation=0,colour='fabric')=>{const a=group('Upholstered lounge chair',g,p);a.rotation.y=rotation;a.userData.contactShadow={width:1.02,depth:.92};for(const x of [-.37,.37])for(const z of [-.34,.34]){const leg=cylinder(a,.025,.36,'wood',[x,.2,z]);leg.rotation.z=x*.16;}box(a,[.87,.23,.83],colour,[0,.49,0],.105);box(a,[.86,.66,.18],colour,[0,.81,-.34],.08);for(const x of [-.46,.46]){box(a,[.14,.22,.8],'wood',[x,.58,.015],.06);box(a,[.105,.13,.73],colour,[x,.69,.015],.047);}box(a,[.7,.055,.68],'linen',[0,.622,.025],.025);tube(a,[[-.33,.645,-.27],[-.33,.65,.3],[.33,.65,.3],[.33,.645,-.27]],.004,'linen');for(const x of [-.24,.24])for(let y=.62;y<1.06;y+=.048)box(a,[.003,.018,.002],'linen',[x,y,-.244],0);tube(a,[[-.34,.65,-.4],[-.34,1.06,-.4],[.34,1.06,-.4],[.34,.65,-.4]],.009,'stone');return a;};
 const sofa=(g,p,rotation=0,colour='linen')=>{const a=group('Tailored sofa',g,p);a.rotation.y=rotation;a.userData.contactShadow={width:2.68,depth:1};for(const x of [-1.15,1.15])for(const z of [-.35,.35])cylinder(a,.025,.2,'brass',[x,.15,z]);box(a,[2.65,.32,.98],colour,[0,.37,0],.1);box(a,[2.65,.66,.22],colour,[0,.78,-.39],.1);for(const x of [-1.28,1.28])box(a,[.22,.57,.95],colour,[x,.64,0],.075);for(const x of [-.8,0,.8]){box(a,[.75,.14,.75],colour,[x,.6,.055],.045);tube(a,[[x-.34,.67,.38],[x+.34,.67,.38]],.007,'stone');}for(const x of [-.93,.93]){const cushion=box(a,[.43,.43,.14],'sage',[x,.85,-.14],.07);cushion.rotation.z=x*.13;}return a;};
 const table=(g,p,r=.7)=>{const a=group('Stone occasional table',g,p);a.userData.contactShadow={width:r*1.3,depth:r*1.3,ellipse:true};cylinder(a,r,.08,'stone',[0,.53,0]);cylinder(a,r*.84,.03,'brass',[0,.479,0]);cylinder(a,.13,.43,'wood',[0,.245,0]);cylinder(a,r*.56,.06,'brass',[0,.055,0]);books(a,[-.23,.58,-.1],3);vase(a,[.2,.58,.05],.45);return a;};
 const lamp=(g,p)=>{const a=group('Reading lamp',g,p);cylinder(a,.22,.04,'brass',[0,.025,0]);cylinder(a,.012,1.65,'brass',[0,.86,0]);cylinder(a,.29,.3,'linen',[0,1.72,0],.2);cylinder(a,.265,.013,'light',[0,1.574,0]);return a;};
 const frame=(g,p,w=2,h=2.7,mat='navy')=>{box(g,[w,.055,.085],mat,[p[0],p[1]-h/2,p[2]]);box(g,[w,.055,.085],mat,[p[0],p[1]+h/2,p[2]]);for(const x of [-w/2,w/2])box(g,[.055,h,.085],mat,[p[0]+x,p[1],p[2]]);};
 const arch=(g,p,width,height,mat='wood')=>{const a=group('Arched frame',g,p),r=width/2,spring=height-r,pts=[[-r,0,0],[-r,spring,0]];for(let i=0;i<=36;i++){const angle=Math.PI-i*Math.PI/36;pts.push([Math.cos(angle)*r,spring+Math.sin(angle)*r,0]);}pts.push([r,0,0]);tube(a,pts,.055,mat);return a;};
 const shell=(g,{colour='plaster',window=true,night=false}={})=>{
  box(g,[18.4,.24,20],'stone',[0,-.14,1.5],.02);box(g,[18,.026,19.3],night?'navy':'ivory',[0,-.012,1.5],0);
  for(let x=-8;x<=8;x+=2)box(g,[.008,.002,19.3],'stone',[x,.003,1.5],0);for(let z=-7;z<11;z+=2)box(g,[18,.002,.008],'stone',[0,.003,z],0);
  box(g,[18.4,.22,20],'plaster',[0,5.4,1.5],.02);
  // Back wall leaves a real lift doorway at x = 6.7.
  box(g,[14.35,5.4,.28],colour,[-1.825,2.7,-6.94]);box(g,[1.15,5.4,.28],colour,[8.425,2.7,-6.94]);box(g,[2.4,2.35,.28],colour,[6.7,4.225,-6.94]);
  for(const x of [-9.08,9.08]){if(window&&x<0){for(let z=-5;z<=10;z+=3){box(g,[.18,5.4,.15],'navy',[x,2.7,z]);box(g,[.025,4.95,2.82],'glass',[x,2.65,z+1.5]);box(g,[.28,.075,2.82],'stone',[x+.06,.3,z+1.5],.015);box(g,[.025,4.85,.025],'rubber',[x+.1,2.65,z+.09],.003);box(g,[.035,.23,.045],'brass',[x+.14,1.52,z+.17],.007);box(g,[.24,.1,2.84],'stone',[x,0.19,z+1.5]);}box(g,[.22,.22,19.2],'navy',[x,5.03,1.6]);box(g,[.22,.045,19.2],'brass',[x,1.2,1.6]);}else{box(g,[.25,5.4,19.8],colour,[x,2.7,1.5]);for(let z=-5;z<=10;z+=3)box(g,[.018,4.45,.024],'brass',[x-Math.sign(x)*.14,2.55,z]);}box(g,[.18,.11,19.3],'stone',[x-Math.sign(x)*.12,.07,1.5]);}
  // Entrance glazing gives the reverse view a finished facade.
  for(const x of [-9,-6,-3,0,3,6,9])box(g,[.08,5.25,.12],'navy',[x,2.65,11.25]);for(const x of [-7.5,-4.5,4.5,7.5])box(g,[2.9,5.1,.02],'glass',[x,2.63,11.25]);box(g,[6,.12,.13],'navy',[0,4.1,11.25]);for(const x of [-.7,.7])box(g,[1.32,3.92,.025],'glass',[x,2.05,11.25]);for(const x of [-1.4,1.4]){box(g,[.06,4,.1],'navy',[x,2.05,11.25]);box(g,[.025,.55,.09],'brass',[Math.sign(x)*.18,1.52,11.18]);}
  for(const x of [-.7,.7]){box(g,[1.32,.045,.07],'brass',[x,.085,11.25]);for(const y of [.3,3.7])box(g,[.1,.15,.07],'brass',[Math.sign(x)*1.34,y,11.25]);}
  box(g,[5.85,.94,.02],'glass',[0,4.61,11.25]);
  box(g,[18.3,.15,.19],'navy',[0,5.12,11.25]);box(g,[18.3,.08,.16],'navy',[0,4.1,11.25]);
  if(!night){
   const porch=group('Entrance terrace and garden depth',g);box(porch,[24,.16,20],'stone',[0,-.14,21]);
   for(let z=12;z<=29;z+=2)box(porch,[22,.008,.017],'ivory',[0,-.052,z]);
   for(const x of [-5,5])plant(porch,[x,0,14.1],x<0?1.2:1.45);
   box(porch,[12,.13,1.15],'ivory',[0,-.17,16.3]);
   for(const x of [-8,8]){box(porch,[3,.55,10],'plaster',[x,.21,23]);for(let i=0;i<6;i++)sphere(porch,.6,i%2?'sage':'leaf',[x+Math.sin(i)*.5,.75,19+i*1.5],[1.4,.65,1.2]);plant(porch,[x,0,27],2.05);}
   box(porch,[25,1.4,.22],'plaster',[0,.6,31]);box(porch,[25,.07,.32],'stone',[0,1.31,31]);
   for(const x of [-9,-3,3,9]){box(porch,[.14,3.6,.14],'wood',[x,1.8,28]);box(porch,[.14,3.6,.14],'wood',[x,1.8,31]);}
   for(const z of [28,31])box(porch,[20.5,.2,.2],'wood',[0,3.5,z]);
   for(let x=-10;x<=10;x+=.65)box(porch,[.09,.15,3.7],'wood',[x,3.63,29.5]);
  }
  for(let x=-7;x<=7;x+=3.5){box(g,[.035,.03,16.5],'light',[x,5.265,1.5],.008);box(g,[.1,.04,16.5],'stone',[x,5.3,1.5],.008);}
  box(g,[14,.07,.05],'light',[-1.3,4.94,-6.72]);
  for(const x of [5.41,7.99])box(g,[.17,3.15,.35],'brass',[x,1.575,-6.75],.025);box(g,[2.75,.16,.35],'brass',[6.7,3.17,-6.75]);box(g,[2.47,.025,.53],'brass',[6.7,.014,-6.6]);
  const call=box(g,[.21,.48,.035],'navy',[8.32,1.38,-6.755]);target(call,{type:'directory'});cylinder(g,.024,.016,'light',[8.32,1.4,-6.72]).rotation.x=Math.PI/2;
  const liftIcon=group('Solid elevator pictogram',g,[6.7,3.6,-6.71]);liftIcon.userData.icon={name:'elevator',tone:night?'ivory':'navy',width:.52};target(liftIcon,{type:'directory'});
  if(window&&!night){
   const court=group('Daylight courtyard',g,[-13,0,0]);box(court,[10,.16,25],'stone',[0,-.13,0]);
   for(let i=0;i<5;i++){const z=-8+i*4.4;const tree=plant(court,[-1+Math.sin(i)*.45,0,z],1.1+(i%3)*.22);tree.rotation.y=i*.81;plant(court,[-3.2,0,z+1.7],1.6+(i%2)*.45);}
   box(court,[.3,1.7,26],'plaster',[-5.3,.85,0]);box(court,[.4,.07,26],'stone',[-5.3,1.735,0]);
   for(let z=-11;z<13;z+=1.2)box(court,[.08,2.7,.12],'wood',[-5.08,1.35,z]);
   const bench=group('Courtyard bench',court,[.8,0,2]);for(const z of [-1.1,1.1])box(bench,[.6,.45,.16],'stone',[0,.225,z]);for(let x=-.35;x<.4;x+=.12)box(bench,[.09,.09,3],'wood',[x,.49,0]);
   box(court,[1.3,.22,5.5],'plaster',[-3.7,.08,1]);for(let i=0;i<7;i++)sphere(court,.42,i%2?'sage':'leaf',[-3.7,.42,-1.2+i*.76],[1,.65,1.2]);
  }
 };
 return {root,materials,material,group,mesh,box,cylinder,sphere,tube,ring,sign,target,books,vase,plant,chair,sofa,table,lamp,frame,arch,shell};
}
