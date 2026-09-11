import * as T from 'three';
import {tagAmbient} from './ambient.js';

// Original display-scale geometry informed by the selected PRODUCT references.
// These are scene interpretations, not product CAD or verified specifications.
export function productExhibits(a){
 const {group,mesh,material,box,sign,target}=a;
 const palette=['#eb787f','#edbe47','#55b8ad','#8b83c3','#dc9368'];
 const cyl=(g,r,h,c,p,rt=r)=>mesh(g,new T.CylinderGeometry(rt,r,h,40),c,p);
 const ball=(g,r,c,p,s=[1,1,1])=>{const m=mesh(g,(r<.01?new T.OctahedronGeometry(r):new T.SphereGeometry(r,28,18)),c,p);m.scale.set(...s);return m;};
 const tor=(g,r,t,c,p,rot=[Math.PI/2,0,0])=>mesh(g,new T.TorusGeometry(r,t,12,64),c,p,rot);
 const line=(g,pts,r,c)=>mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),24,r,6,false),c);
 const shape=(g,points,depth,c,p=[0,0,0])=>{const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const geo=depth<=.004?new T.ShapeGeometry(s):new T.ExtrudeGeometry(s,{depth,bevelEnabled:depth>.04,bevelThickness:.009,bevelSize:.01,bevelSegments:1,curveSegments:8});geo.translate(0,0,-depth/2);return mesh(g,geo,c,p);};
 const star=(g,r,c,p=[0,0,0],depth=.13)=>shape(g,Array.from({length:10},(_,i)=>{const t=Math.PI/2+i*Math.PI/5,d=i%2?r*.48:r;return [Math.cos(t)*d,Math.sin(t)*d];}),depth,c,p);
 const decal=(g,r,c,p,s=[1,1])=>{const m=mesh(g,new T.CircleGeometry(r,12),c,p);m.scale.set(s[0],s[1],1);return m;};
 const label=(g,zh,en,p,w=1.1,h=.12)=>sign(g,[zh],p,w,h,{i18n:{zh:[zh],en:[en]}});
 const exhibit=(parent,id,p)=>target(group('PRODUCT inspired exhibit · '+id,parent,p),{type:'roomProducts',id});
 function reference(g,id,p){
  const stand=group('Product source photograph · '+id,g,p);stand.rotation.x=-.13;
  box(stand,[.39,.51,.026],'ivory',[0,0,0],.012);box(stand,[.41,.027,.19],'brass',[0,-.25,.025],0);
  const mount=group('PRODUCT source image',stand,[0,0,.018]);mount.userData.productReference={id,w:.35,h:.47};
 }
 function tube(g,p,c='ivory',s=1){
  const m=group('Squeeze tube with sealed shoulder and cap',g,p);m.scale.setScalar(s);
  const body=mesh(m,new T.CylinderGeometry(.072,.086,.43,40),c,[0,.3,0]);body.scale.z=.58;
  box(m,[.14,.02,.044],c,[0,.52,0],0);for(let i=0;i<7;i++)box(m,[.004,.016,.006],'stone',[-.052+i*.017,.52,.025],0);
  cyl(m,.069,.087,'#79523d',[0,.053,0]);tor(m,.064,.004,'#b78354',[0,.09,0]);
  label(m,'唇部护理','LIP CARE',[0,.31,.052],.12,.075);return m;
 }
 function lipDisplay(parent,p=[0,0,0],s=1,hero=true){
  const g=exhibit(parent,'beauty-lip-balm',p);g.scale.setScalar(s);
  box(g,[1.15,.05,.64],'ivory',[0,.025,0],0);box(g,[1.15,.64,.035],'#d7b790',[0,.35,-.3],.01);
  label(g,'唇部护理','LIP CARE',[0,.6,-.272],.92,.15);
  for(let i=0;i<3;i++)tube(g,[-.34+i*.32,.05,-.07]);
  const single=tube(g,[.33,.05,.17],'#e5c692',1.3);single.rotation.z=-.06;
  if(hero)reference(g,'beauty-lip-balm',[-.32,.32,.33]);return g;
 }
 function bathStar(g,p,s=1){
  const obj=group('Five-colour bath star',g,p);obj.scale.setScalar(s);star(obj,.38,'#ed88b4');
  // Radial inlays and restrained grains read as a bath compound up close.
  const pts=Array.from({length:10},(_,i)=>{const t=Math.PI/2+i*Math.PI/5,r=i%2?.18:.38;return [Math.cos(t)*r,Math.sin(t)*r];});
  for(let i=0;i<5;i++)shape(obj,[[0,0],pts[i*2],pts[(i*2+1)%10],pts[(i*2+2)%10]],.018,palette[i],[0,0,.085]);
  for(let i=0;i<42;i++){const angle=i*2.399,r=.05+(i%6)*.032;ball(obj,.007,'ivory',[Math.cos(angle)*r,Math.sin(angle)*r,.11]);}return obj;
 }
 function bathDisplay(parent,p=[0,0,0],s=1,hero=true){
  const g=exhibit(parent,'beauty-bath-star',p);g.scale.setScalar(s);cyl(g,.58,.055,'ivory',[0,.028,0]);
  box(g,[.73,.88,.035],'#b4ce69',[0,.55,-.23],.015);label(g,'沐浴时光','BATH RITUAL',[0,.91,-.205],.64,.14);bathStar(g,[0,.48,-.14],1.05);
  bathStar(g,[.34,.16,.19],.57).rotation.x=-1.16;for(let i=0;i<2;i++)cyl(g,.11,.31,'linen',[-.38,.16,-.19+i*.16]).rotation.z=Math.PI/2;
  if(hero)reference(g,'beauty-bath-star',[-.37,.3,.31]);return g;
 }
 function nailBoard(g,p,s=1){
  const b=group('Nail decal collection board',g,p);b.scale.setScalar(s);box(b,[.53,.72,.026],'ivory',[0,.36,0],.01);box(b,[.55,.18,.035],'#cf719e',[0,.8,0],.012);label(b,'美甲贴','NAIL ART',[0,.8,.025],.48,.11);
  for(let row=0;row<4;row++)for(let col=0;col<5;col++){
   const n=group('Decorative nail decal',b,[-.2+col*.1,.16+row*.137,.024]);decal(n,.044,palette[(row+col)%5],[0,0,.008],[.8,1.3]);if((row+col)%2)star(n,.024,'white',[0,0,.013],.004);else{decal(n,.011,'yellow',[0,0,.014]);for(let j=0;j<5;j++)decal(n,.012,'white',[Math.cos(j*1.256)*.021,Math.sin(j*1.256)*.021,.012]);}
  }return b;
 }
 function nailDisplay(parent,p=[0,0,0],s=1,hero=true){
  const g=exhibit(parent,'beauty-nail-stickers',p);g.scale.setScalar(s);box(g,[1.22,.065,.6],'ivory',[0,.033,0],.02);
  nailBoard(g,[-.2,.07,-.12]);const b=nailBoard(g,[.33,.07,-.07],.72);b.rotation.y=-.3;
  for(let i=0;i<3;i++){cyl(g,.042,.12,palette[i],[.15+i*.13,.125,.17]);cyl(g,.021,.065,'white',[.15+i*.13,.216,.17]);}
  if(hero)reference(g,'beauty-nail-stickers',[-.42,.32,.31]);return g;
 }
 function jarBoard(g,p,c,s=1){
  const jar=group('Flat jar shaped colour sorting board',g,p);jar.scale.setScalar(s);
  shape(jar,[[-.22,0],[.22,0],[.24,.07],[.24,.43],[.16,.51],[.16,.59],[-.16,.59],[-.16,.51],[-.24,.43],[-.24,.07]],.025,'ivory');
  box(jar,[.37,.12,.042],c,[0,.57,.002],.012);for(let i=0;i<5;i++)box(jar,[.007,.065,.008],'white',[-.13+i*.065,.57,.027],0);
  for(let i=0;i<5;i++){const x=-.12+(i%2)*.22,y=.1+Math.floor(i/2)*.13; if(i%2)star(jar,.048,c,[x,y,.033],.014);else{ball(jar,.047,c,[x,y,.036],[1,.9,.3]);ball(jar,.013,'sage',[x+.012,y+.04,.04],[.5,1,.3]);}}
  return jar;
 }
 function sortingDisplay(parent,p=[0,0,0],s=1,hero=true){
  const g=exhibit(parent,'play-colour-magnets',p);g.scale.setScalar(s);box(g,[1.36,.055,.78],'oak',[0,.03,0],.015);
  for(let i=0;i<3;i++){const b=jarBoard(g,[-.43+i*.43,.16,-.19],palette[i],.85);b.rotation.x=-.12;box(g,[.33,.11,.19],'wood',[-.43+i*.43,.1,-.21],.015);}
  for(let i=0;i<7;i++){const token=star(g,.051,palette[i%5],[-.52+i*.15,.078,.22],.014);token.rotation.x=-Math.PI/2;}
  if(hero)reference(g,'play-colour-magnets',[.36,.29,.28]);return g;
 }
 function compoundTub(g,p,c,s=1){
  const tub=group('Creative compound tub and lid',g,p);tub.scale.setScalar(s);cyl(tub,.14,.18,'ivory',[0,.095,0],.155);cyl(tub,.16,.035,c,[0,.199,0]);tor(tub,.145,.008,c,[0,.178,0]);
  box(tub,[.19,.09,.005],c,[0,.095,.162],0);label(tub,'造型','CREATE',[0,.1,.168],.16,.065);return tub;
 }
 function compoundsDisplay(parent,p=[0,0,0],s=1,hero=true){
  const g=exhibit(parent,'play-compounds',p);g.scale.setScalar(s);box(g,[1.38,.055,.86],'oak',[0,.028,0],.02);box(g,[1.25,.016,.7],'#afd6c5',[0,.065,0],.015);
  for(let i=0;i<4;i++)compoundTub(g,[-.45+i*.3,.08,-.27],palette[i]);compoundTub(g,[-.17,.3,-.27],palette[4]);
  star(g,.14,'#b09ad0',[-.34,.11,.15],.035).rotation.x=-Math.PI/2;ball(g,.11,'#efbf5b',[0,.13,.15],[1,.5,1]);
  tor(g,.08,.018,'rose',[0,.105,.15]);const roller=cyl(g,.035,.37,'wood',[.28,.11,.14]);roller.rotation.z=Math.PI/2;const handle=cyl(g,.018,.59,'navy',[.28,.11,.14]);handle.rotation.z=Math.PI/2;
  if(hero)reference(g,'play-compounds',[.43,.32,.32]);return g;
 }
 function telescopeDisplay(parent,p=[0,0,0],s=1,hero=true){
  const g=exhibit(parent,'play-telescope',p);g.scale.setScalar(s);
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3,foot=[Math.cos(angle)*.44,.05,Math.sin(angle)*.44];line(g,[[0,1.01,0],foot],.033,'steel');ball(g,.045,'rubber',foot,[1,.6,1]);line(g,[[0,.52,0],[foot[0]*.62,.41,foot[2]*.62]],.013,'navy');}
  cyl(g,.073,.2,'navy',[0,1.03,0]);
  const az=tagAmbient(group('Motorised telescope azimuth bearing',g,[0,1.12,0]),{kind:'trackingAzimuth',period:34,amplitude:.24});
  az.rotation.y=Math.PI/2+.3;cyl(az,.09,.07,'brass',[0,0,0]);
  box(az,[.16,.11,.13],'navy',[.13,.06,0],.018);
  for(const x of [-.12,.12]){box(az,[.035,.18,.11],'steel',[x,.075,0],.012);cyl(az,.045,.04,'brass',[x,.14,0]).rotation.z=Math.PI/2;}
  const scope=tagAmbient(group('Optical tube altitude mount',az,[0,.14,0]),{kind:'trackingAltitude',period:27});scope.rotation.x=.35;
  const barrel=cyl(scope,.093,.97,'steel',[0,0,0]);barrel.rotation.x=Math.PI/2;
  for(const z of [-.48,.43]){cyl(scope,.11,.12,'navy',[0,0,z]).rotation.x=Math.PI/2;tor(scope,.106,.006,'steel',[0,0,z],[0,0,0]);}
  cyl(scope,.088,.01,'#396078',[0,0,-.546]).rotation.x=Math.PI/2;
  line(scope,[[0,0,.48],[0,0,.64],[0,.11,.67]],.031,'navy');cyl(scope,.041,.075,'rubber',[0,.15,.67]);
  box(scope,[.034,.12,.04],'navy',[.07,.1,.01],0);cyl(scope,.027,.3,'navy',[.07,.18,.01]).rotation.x=Math.PI/2;
  line(g,[[.08,1.05,0],[.25,.9,.22]],.014,'steel');ball(g,.035,'rubber',[.25,.9,.22],[.6,.6,1.7]);
  if(hero)reference(g,'play-telescope',[-.35,.3,.35]);return g;
 }
 function foilDisplay(parent,p=[0,0,0]){
  const g=exhibit(parent,'party-number-balloon',p);const foil=new T.MeshStandardMaterial({color:'#d5b56e',metalness:.82,roughness:.25});foil.name='Golden foil';
  const f=tagAmbient(group('Tethered foil number nine',g,[0,.18,0]),{kind:'sway',period:11,amplitude:.024});
  tor(f,.44,.16,foil,[0,1.69,0],[0,0,0]);line(f,[[.43,1.7,0],[.44,1.24,0],[.32,.85,0],[.03,.65,0]],.155,foil);
  tor(f,.442,.006,'#f4d38a',[0,1.69,.155],[0,0,0]);line(f,[[.02,.58,0],[-.07,.35,0],[0,-.15,0]],.004,'ivory');box(f,[.044,.095,.013],foil,[.025,.58,0],0);
  cyl(g,.3,.05,'brass',[0,.025,0]);reference(g,'party-number-balloon',[.55,.3,.1]);return g;
 }
 function blowout(g,p,c,angle=0,s=1){const b=group('Polka dot party blowout',g,p);b.rotation.y=angle;b.scale.setScalar(s);cyl(b,.022,.23,'white',[0,0,.11]).rotation.x=Math.PI/2;cyl(b,.054,.074,c,[0,.015,-.05]).rotation.z=Math.PI/2;cyl(b,.047,.002,'ivory',[.038,.015,-.05]).rotation.z=Math.PI/2;line(b,Array.from({length:25},(_,i)=>{const a=i*Math.PI/6,r=.005+i*.0017;return [.040,.015+Math.sin(a)*r,-.05+Math.cos(a)*r];}),.003,c);for(let i=0;i<6;i++)ball(b,.0045,'white',[-.015,Math.sin(i)*.056+.015,Math.cos(i)*.056-.05]);return b;}
 function favorsDisplay(parent,p=[0,0,0],s=1,hero=true){const g=exhibit(parent,'party-blowouts',p);g.scale.setScalar(s);cyl(g,.57,.035,'ivory',[0,.02,0]);for(let i=0;i<6;i++)blowout(g,[-.32+(i%3)*.28,.085,-.18+Math.floor(i/3)*.27],palette[i%5],(i-2)*.22,1.2);if(hero)reference(g,'party-blowouts',[.25,.32,.28]);return g;}
 function face(g,p,r){for(const x of [-.28,.28])ball(g,r*.075,'navy',[p[0]+x*r,p[1]+r*.18,p[2]],[1,1,.35]);line(g,[[p[0]-.34*r,p[1]-.15*r,p[2]],[p[0],p[1]-.35*r,p[2]],[p[0]+.34*r,p[1]-.15*r,p[2]]],r*.035,'navy');}
 function candles(parent,p=[0,0,0]){const g=exhibit(parent,'party-smile-candles',p);for(let i=0;i<5;i++){
   const c=group('Smile flower and lightning birthday candle',g,[-.32+i*.16,0,(i%2)*-.12]);cyl(c,.008,.13,'white',[0,.065,0]);
   if(i===2)shape(c,[[-.018,.17],[.06,.32],[.012,.29],[.045,.43],[-.065,.25],[-.01,.26]],.038,'yellow');
   else{if(i===0||i===4)for(let n=0;n<6;n++)ball(c,.049,'#e483a4',[Math.cos(n*Math.PI/3)*.09,.245+Math.sin(n*Math.PI/3)*.09,0],[1,1,.4]);ball(c,.088,i===3?'#e694bc':'#f5ce57',[0,.245,.012],[1,1,.25]);face(c,[0,.245,.038],.083);}
   const top=i===2?.44:(i===0||i===4)?.39:.34;cyl(c,.006,.045,'white',[0,top,0]);const flame=tagAmbient(group('Small birthday candle flame',c,[0,top+.045,0]),{kind:'flame',period:2.6,phase:i*.19});ball(flame,.017,'light',[0,0,0],[.6,1.5,.6]);
  }return g;}
 return {lipDisplay,bathDisplay,nailDisplay,sortingDisplay,compoundsDisplay,telescopeDisplay,foilDisplay,favorsDisplay,candles,blowout,label,reference,jarBoard,compoundTub};
}
