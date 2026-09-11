import * as T from 'three';
import {workshop} from './craft.js';
import { poweredPlatter, guidedFixture } from './scene-models/working-props.js';
import {tagAmbient} from './ambient.js';
import {printContour} from './core/process-motion.js';
import {consolidationLoop} from './scene-models/consolidation-loop.js';
import {REGION_JOURNEYS,STATION_Z} from './regional-journeys.js';

// One continuous, walkable building. Every bay has physical structure and tools;
// signs describe conceptual business stages rather than invented factory facts.
export function buildRegionalScene(id){
 const a=workshop(),{root,group,box,cylinder,sphere,tube,ring,sign,frame,plant,chair,sofa,books,vase,target,material}=a;
 const j=REGION_JOURNEYS[id],accent=j.accent;
 root.name='SHOWROOM · '+id+' process promenade';root.userData={sceneId:id,concept:true,units:'metres',layout:'process-promenade',revision:1};
 material('stone').color.set('#c5bdad');material('ivory').color.set('#eee8dc');
 const steel=material('steel');steel.color.set('#9baeb5');steel.metalness=.78;steel.roughness=.32;
 const rubber=material('rubber');rubber.color.set('#303e49');rubber.roughness=.85;
 const b=(g,s,m,p,r=.015)=>box(g,s,m,p,r);
 const sample=(g,id,p,h=.5)=>{const mount=group('Concept sample · '+id,g,p);mount.userData.sample={id,height:h};return mount;};
 function tablet(g,p,w=1,words=['SHOWROOM','WORKSPACE'],display){
  const t=group('Bezel, stand and display',g,p),h=(w-.08)/2+.08;
  b(t,[w,h,.07],'navy',[0,.36,0]);
  if(display){const screen=group('Working screen mount',t,[0,.36,.041]);screen.userData.workingDisplay={w:w-.08,h:h-.08,...display};}
  else sign(t,words,[0,.36,.041],w-.08,h-.08,{background:'#163b50',colour:'#eee4ce'});
  b(t,[.05,.36-h/2,.08],'steel',[0,(.36-h/2)/2,-.04]);b(t,[.48,.025,.3],'steel',[0,-.015,.05]);
  sphere(t,.008,'light',[w/2-.035,.36-h/2+.025,.043]);return t;
 }
 function turntable(g,id,p,height=.4,radius=.26,period=30){
  const base=group('Powered sample review turntable',g,p);
  cylinder(base,radius,.05,'navy',[0,.025,0]);ring(base,radius-.008,.006,'brass',[0,.049,0]);
  sphere(base,.012,'teal',[0,.025,radius]);tube(base,[[0,.02,-radius],[0,.014,-radius-.12],[.1,.014,-radius-.2]],.007,'rubber');
  const platter=tagAmbient(group('Bearing-mounted sample platter',base,[0,.062,0]),{kind:'turntable',period});
  cylinder(platter,radius-.018,.022,'steel',[0,0,0]);sample(platter,id,[0,.014,0],height);return base;
 }
 function bench(g,p,w=4,d=1.3,top='ivory'){const t=group('Detailed workbench',g,p);b(t,[w,.1,d],top,[0,.98,0],.04);b(t,[w-.1,.075,d-.1],'navy',[0,.895,0]);for(const x of [-w/2+.15,w/2-.15])for(const z of [-d/2+.15,d/2-.15]){b(t,[.07,.88,.07],'steel',[x,.45,z]);cylinder(t,.06,.025,'rubber',[x,.025,z]);}b(t,[w-.3,.06,.05],'steel',[0,.26,-d/2+.15]);return t;}
 function drawer(g,p,w=1.3){const d=group('Drawer cabinet and handles',g,p);b(d,[w,.8,.7],'ivory',[0,.42,0]);for(let k=0;k<3;k++){b(d,[w-.08,.23,.022],'stone',[0,.18+k*.24,.36]);b(d,[w*.4,.025,.035],'steel',[0,.18+k*.24,.39]);}return d;}
 function sheets(g,p,n=4){for(let i=0;i<n;i++){const sheet=b(g,[.5,.006,.36],'white',[p[0],p[1]+i*.007,p[2]],0);sheet.rotation.y=i*.045;}for(let k=0;k<4;k++)b(g,[.34,.003,.008],'stone',[p[0],p[1]+n*.007,p[2]-.12+k*.065],0);}
 function swatches(g,p,rows=3,cols=8){for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const m=['ivory','rose','sage','teal','linen','navy','lilac','wood'][(x+y)%8];b(g,[.27,.35,.035],m,[p[0]+x*.35,p[1]+y*.44,p[2]],.006);cylinder(g,.012,.017,'brass',[p[0]+x*.35,p[1]+y*.44+.13,p[2]+.023]).rotation.x=Math.PI/2;}}
 function board(g,words,w=4.9){b(g,[w,.9,.085],'linen',[0,2.3,-1.77]);frame(g,[0,2.3,-1.72],w,.9,'oak');sign(g,words,[0,2.3,-1.66],w-.2,.6,{colour:'#18364c'});}
 function carton(g,p,size=[.7,.54,.64]){const c=group('Folded carton with label and tape',g,p),[w,h,d]=size;b(c,size,'wood',[0,h/2,0],.012);b(c,[w+.008,.01,.055],'linen',[0,h+.008,0],0);b(c,[.06,h+.006,.012],'linen',[0,h/2,d/2+.008],0);b(c,[.25,.16,.01],'ivory',[w*.22,h*.6,d/2+.012],0);for(let i=0;i<9;i++)b(c,[i%3===0?.014:.007,.095,.005],'navy',[w*.22-.09+i*.021,h*.6,d/2+.021],0);return c;}
 function pallet(g,p){const s=group('Timber pallet',g,p);for(const x of [-.54,0,.54])for(const z of [-.45,.45])b(s,[.15,.13,.18],'wood',[x,.105,z],.006);for(let i=0;i<6;i++)b(s,[1.3,.045,.15],'oak',[0,.2,-.48+i*.19],.004);for(const x of [-.53,0,.53])b(s,[.16,.035,1.15],'wood',[x,.023,0],.004);return s;}
 function conveyor(g,p,length=4){const c=group('Roller conveyor, bearings and drive',g,p);for(const z of [-.55,.55]){b(c,[length,.17,.09],'steel',[0,.94,z]);for(const x of [-length/2+.2,length/2-.2]){b(c,[.08,.85,.08],'navy',[x,.45,z]);cylinder(c,.065,.03,'rubber',[x,.03,z]);}for(let x=-length/2+.12;x<length/2;x+=.36)sphere(c,.025,'navy',[x,.94,z+Math.sign(z)*.05]);}for(let x=-length/2+.13;x<length/2;x+=.19){const r=cylinder(c,.066,1.05,'steel',[x,1,0]);r.rotation.x=Math.PI/2;}b(c,[.42,.34,.32],'navy',[length/2-.4,.69,-.68]);tube(c,[[length/2-.4,.7,-.7],[length/2-.5,.3,-.7],[length/2-1,.3,-.65]],.018,'rubber');return c;}
 function lamp(g,p){const l=group('Articulated inspection task light',g,p);cylinder(l,.14,.03,'steel',[0,.015,0]);tube(l,[[0,.04,0],[0,.43,0],[.34,.74,0],[.55,.68,0]],.025,'steel');sphere(l,.048,'navy',[0,.43,0]);sphere(l,.048,'navy',[.34,.74,0]);b(l,[.28,.045,.2],'navy',[.55,.65,0]);b(l,[.25,.01,.17],'light',[.55,.623,0]);return l;}
 function shelf(g,p,w=4.8,items='sample'){const s=group('Modular display cabinet',g,p);for(const x of [-w/2,w/2])b(s,[.06,2.45,.58],'navy',[x,1.25,0]);for(let k=0;k<3;k++){const y=.33+k*.85;b(s,[w,.055,.64],'oak',[0,y,0]);b(s,[w-.13,.018,.018],'light',[0,y-.04,.28]);for(let n=0;n<6;n++){const x=-w/2+.4+n*(w-.8)/5;if(items==='carton')carton(s,[x,y+.028,0],[.46,.48,.45]);else{cylinder(s,.08,.3+(n%3)*.07,['rose','sage','ivory','teal','lilac','brass'][n],[x,y+.2,0]);cylinder(s,.055,.065,'brass',[x,y+.39+(n%3)*.04,0]);}}}return s;}

 // A 42 m promenade with a 5 m clear central route, windows, repeated portals,
 // recessed display plinths and real joints instead of a flat room backdrop.
 b(root,[18.4,.22,42.5],'stone',[0,-.14,-9.1]);b(root,[5,.035,41.8],'ivory',[0,-.007,-9.1],0);
 for(const x of [-2.48,2.48]){b(root,[.035,.012,41.8],'brass',[x,.016,-9.1],0);b(root,[.11,.012,41.8],'navy',[x+Math.sign(x)*.09,.014,-9.1],0);}
 for(let z=-29;z<=11;z+=1.5)b(root,[4.96,.002,.008],'stone',[0,.014,z],0);
 b(root,[18.4,.2,42.5],'plaster',[0,5.35,-9.1]);
 for(const x of [-2.5,2.5]){b(root,[.2,.16,41.9],'navy',[x,5.12,-9.1]);b(root,[.035,.016,41.7],'light',[x,5.028,-9.1],0);}
 for(let z=-28;z<=10;z+=2.4){b(root,[4.55,.12,.065],'oak',[0,5.12,z],.008);}
 for(const x of [-9.08,9.08]){b(root,[.24,.62,42.2],'plaster',[x,.31,-9.1]);b(root,[.32,.07,42.2],'stone',[x,.65,-9.1]);b(root,[.24,.45,42.2],'plaster',[x,5.1,-9.1]);b(root,[.08,.08,42.2],'navy',[x,3.7,-9.1]);for(let z=-29;z<=10;z+=3.5){b(root,[.1,4.2,.085],'navy',[x,2.7,z]);b(root,[.025,4.05,3.36],'glass',[x,2.73,z+1.75],0);}}
 for(const z of [7.4,-4.7,-16.7,-28]){for(const x of [-2.78,2.78]){b(root,[.27,4.78,.22],'navy',[x,2.4,z]);b(root,[.035,4.35,.024],'brass',[x-Math.sign(x)*.14,2.48,z+.13],.004);}b(root,[5.84,.38,.23],'navy',[0,4.66,z]);b(root,[5.24,.035,.025],'light',[0,4.443,z+.05],0);}
 // Daylight outside the glazing has a near terrace and planted silhouette layer.
 for(const x of [-12.3,12.3]){b(root,[5.9,.1,48],'stone',[x,-.19,-8]);b(root,[.2,1.25,48],'plaster',[x+Math.sign(x)*2.2,.5,-8]);for(const z of [5,-8,-23]){plant(root,[x,0,z],1.7);b(root,[2,.32,3.1],'plaster',[x,.02,z]);}}
 for(const x of [-8,-5,-2,1,4,7]){b(root,[.065,5.2,.1],'navy',[x,2.6,-30.1]);b(root,[2.9,5.05,.025],'glass',[x+1.5,2.6,-30.1],0);}
 b(root,[18.4,.14,.14],'navy',[0,5.18,-30.1]);
 const ending=group('Regional journey closing wall',root,[0,0,-29.55]);b(ending,[5.1,2.65,.13],'navy',[0,1.4,0]);const endLogo=group('Optional identity in the capability promenade',ending,[0,1.84,.1]);endLogo.userData.identity={width:2.75,light:true};sign(ending,['CONNECTED CAPABILITIES'],[0,.72,.08],3.7,.3,{colour:'#eee4ce'});b(ending,[5.3,.065,.27],'brass',[0,2.76,0]);
 // Shared physical elevator in a side vestibule. Its coordinates match the host cabin.
 const vestibule=group('Side elevator vestibule',root);for(const x of [5.29,8.12])b(vestibule,[.2,3.45,3.4],'plaster',[x,1.725,-8.13]);b(vestibule,[3.03,.18,3.4],'navy',[6.7,3.45,-8.13]);for(const x of [5.41,7.99])b(vestibule,[.17,3.15,.3],'brass',[x,1.58,-6.72]);b(vestibule,[2.75,.16,.3],'brass',[6.7,3.17,-6.72]);b(vestibule,[2.47,.025,.52],'brass',[6.7,.014,-6.6]);const liftIcon=group('Solid elevator pictogram',vestibule,[6.7,3.66,-6.71]);liftIcon.userData.icon={name:'elevator',tone:'navy',width:.52};target(liftIcon,{type:'directory'});target(b(vestibule,[.22,.42,.04],'navy',[8.31,1.38,-6.72]),{type:'directory'});

 function bay(i,side){const z=STATION_Z[i]+(i===1&&side===1?-3.3:0),g=group(`${j.steps[i].id} / ${side<0?'left':'right'} studio`,root,[side*5.9,0,z]);g.rotation.y=side<0?Math.PI/2:-Math.PI/2;
  b(g,[6.9,.045,4.3],'stone',[0,.013,-.05],.02);b(g,[6.65,.035,4.05],'ivory',[0,.054,-.05],.015);
  b(g,[6.8,3.55,.13],'plaster',[0,1.85,-1.95]);for(const x of [-3.36,3.36]){b(g,[.11,3.62,3.95],'oak',[x,1.85,-.04]);b(g,[.035,3.45,.045],'brass',[x-Math.sign(x)*.08,1.85,1.95]);}
  b(g,[6.86,.12,4.1],'navy',[0,3.71,-.04]);b(g,[5.9,.022,.065],'light',[0,3.635,1.7]);b(g,[6.45,.035,.055],'light',[0,3.54,-1.77]);
  const besideMachine=side<0&&((id==='china'&&i===2)||(id==='cambodia'&&i===0));sign(g,[j.steps[i].sides[side<0?0:1][0],j.steps[i].sides[side<0?0:1][1]],[besideMachine?2.16:0,besideMachine?3.34:3.22,-1.85],besideMachine?2.05:6.15,besideMachine?.29:.39,{colour:'#16384c'});
  const label=group('Aisle chapter plaque',root,[side*3.25,0,z+2.05]);label.rotation.y=side<0?.3:-.3;b(label,[.48,.96,.14],'navy',[0,.52,0]);b(label,[.51,.035,.18],'brass',[0,1.015,0]);sign(label,[String(i+1).padStart(2,'0')],[0,.65,.08],.36,.33,{colour:'#efdfbc'});sign(label,[side<0?'A':'B'],[0,.3,.08],.22,.17,{colour:'#c5b084'});
  target(g,{type:'region',id,chapter:i,side:side<0?'left':'right'});return g;
 }
 const bays=j.steps.map((s,i)=>{sign(root,[s.name[0],s.name[1]],[0,4.68,[7.4,-4.7,-16.7][i]+.14],4.7,.33,{colour:'#eee3ce'});return [bay(i,-1),bay(i,1)];});

 if(id==='cambodia'){
  const [prod,tool]=bays[0],line=conveyor(prod,[0,0,.15],5.3);
  for(const slot of [-1,0,1]){
   const carrier=tagAmbient(group('Indexed sample carrier',line,[slot*1.8,0,0]),{kind:'carrier',slot,pitch:1.8,count:3,period:7});
   cylinder(carrier,.19,.035,'navy',[0,1.09,0]);cylinder(carrier,.09,.32,'ivory',[0,1.265,0]);cylinder(carrier,.07,.08,'brass',[0,1.465,0]);
  }
  // Opaque entry/exit guards hide the conceptual recirculation outside the work zone.
  for(const x of [-2.48,2.48]){
   const guard=group('Covered conveyor return',line,[x,0,0]);
   b(guard,[1.12,.045,1.21],'steel',[0,1.68,0],.022);
   for(const z of [-.59,.59]){b(guard,[1.12,.62,.045],accent,[0,1.35,z],.018);for(let i=0;i<6;i++)b(guard,[.015,.15,.009],'navy',[-.25+i*.1,1.33,z+Math.sign(z)*.027],.003);}
   b(guard,[.045,.62,1.21],accent,[Math.sign(x)*.56,1.35,0]);
  }
  const gantry=group('Guarded process gantry',prod,[0,0,.15]);for(const x of [-.7,.7]){b(gantry,[.15,2.8,.18],accent,[x,1.4,-.65]);b(gantry,[.08,1.8,.065],'steel',[x,1.75,-.54]);}b(gantry,[1.62,.28,.54],accent,[0,2.74,-.55]);const head=tagAmbient(group('Guided tooling head',gantry,[0,.18,0]),{kind:'processHead',period:7,amplitude:-.2});b(head,[.42,.45,.35],'navy',[0,2.08,-.08]);cylinder(head,.045,.36,'steel',[0,1.72,0]);b(head,[.28,.26,.015],'steel',[0,2.08,.105]);for(const x of [-.095,.095])for(const y of [1.99,2.17])cylinder(head,.015,.014,'navy',[x,y,.12]).rotation.x=Math.PI/2;for(const x of [-.16,.16]){cylinder(gantry,.022,.74,'steel',[x,2.35,-.2]);cylinder(head,.045,.17,'steel',[x,2.28,-.2]);}for(let i=0;i<5;i++)b(head,[.15,.012,.012],'navy',[0,2.02+i*.029,.123],0);for(const x of [-.66,.66])b(gantry,[.024,1.16,1.1],'glass',[x,1.87,-.12],0);tube(gantry,[[.4,2.55,-.8],[.9,2.3,-.8],[.9,1.4,-.8]],.03,'rubber');
  const motor=group('Conveyor drive inspection end',line,[2.25,.69,-.86]);ring(motor,.14,.025,'steel',[0,0,0],[0,0,0]);const fan=tagAmbient(group('Slow demonstration drive rotor',motor),{kind:'drive',period:7,pitch:1.8,radius:.14});fan.rotation.x=Math.PI/2;for(let k=0;k<4;k++){const blade=b(fan,[.18,.02,.035],'steel',[0,0,0]);blade.rotation.y=k*Math.PI/4;}cylinder(fan,.035,.04,'navy',[0,0,0]);
  const control=group('Process operator pedestal',prod,[1.15,0,1.13]);b(control,[.55,1.2,.5],'ivory',[0,.6,0]);tablet(control,[0,1.18,.03],.82,['PROCESS','CONCEPT'],{kind:'process',period:7});for(let i=0;i<3;i++)sphere(control,.045,['teal','yellow','rose'][i],[i*.12-.12,1.07,.28]);for(let k=0;k<6;k++)b(control,[.36,.017,.01],'navy',[0,.3+k*.07,.258],.004);
  const t=bench(tool,[0,0,.18],4.6,1.45);for(const x of [-1.5,0,1.5])guidedFixture(a,t,[x,1.034,0]);drawer(tool,[-2.15,0,-.85]);sheets(t,[1.85,1.044,.34]);
  b(tool,[4.8,1.15,.06],'navy',[0,2.38,-1.8]);for(let x=-2;x<=2;x+=.4)for(let y=2.02;y<2.85;y+=.18)cylinder(tool,.012,.012,'stone',[x,y,-1.76]).rotation.x=Math.PI/2;
  for(let i=0;i<7;i++){const x=-1.8+i*.6;tube(tool,[[x,2.6,-1.72],[x,2.32,-1.72],[x+.14,2.25,-1.72]],.025,'steel');b(tool,[.095,.16,.07],i%2?'teal':'ivory',[x,2.61,-1.71]);}
  const [qc,records]=bays[1],q=bench(qc,[0,0,.25],5,1.45);drawer(qc,[-1.9,0,-.45]);lamp(q,[-1.85,1.04,-.3]);tablet(q,[1.65,1.07,-.35],.9,['SAMPLE / REVIEW'],{kind:'inspection'});
  // Optical inspection bench, height gauge, inspection tray and caliper.
  b(q,[1.2,.055,.75],'navy',[-.65,1.055,0]);cylinder(q,.065,.8,'steel',[-.82,1.5,-.27]);b(q,[.14,.35,.14],'ivory',[-.82,1.64,-.27]);tube(q,[[-.82,1.7,-.27],[-.37,1.7,-.27],[-.3,1.55,-.12]],.05,'navy');ring(q,.2,.028,'steel',[-.3,1.53,-.12],[0,0,0]);b(q,[.45,.022,.12],'steel',[.65,1.075,.35]);for(const x of [.5,.8])b(q,[.045,.025,.25],'steel',[x,1.076,.27]);sample(q,'serum',[-.33,1.08,.03],.32);const scan=tagAmbient(group('Inspection carriage',q,[-.32,0,0]),{kind:'scanner',period:8});b(scan,[.51,.009,.018],'teal',[0,1.089,0],.004);for(const x of [-.6,-.05])b(q,[.015,.025,.52],'steel',[x,1.089,0]);sheets(q,[1,1.045,.22]);
  ring(q,.08,.025,'navy',[-.73,1.68,-.19],[Math.PI/2,0,0]);for(let k=0;k<11;k++)b(q,[k%5===0?.075:.038,.009,.012],'navy',[-.795,1.15+k*.054,-.222],0);for(const x of [-1.65,1.45]){b(qc,[1.35,.84,.04],'ivory',[x,2.35,-1.8]);frame(qc,[x,2.35,-1.765],1.35,.84,'steel');for(let n=0;n<3;n++){ring(qc,.11+n*.025,.009,['navy','teal','brass'][n],[x-.38+n*.38,2.39,-1.73],[0,0,0]);b(qc,[.21,.009,.008],'stone',[x-.38+n*.38,2.08,-1.72],0);}}drawer(qc,[1.93,0,-.5]);
  shelf(records,[0,0,-.92],5.2);const r=bench(records,[0,0,.95],3.2,.72);for(let n=0;n<3;n++){b(r,[.58,.035,.4],'navy',[-1+n,1.055,0]);cylinder(r,.08,.28,['ivory','rose','teal'][n],[-1+n,1.21,0]);}sign(records,['REFERENCE / REVIEW / RECORD'],[0,2.98,-1.8],5,.22);
  const [pack,store]=bays[2];consolidationLoop(a,pack,carton);
  for(const x of [-2.55,2.55]){pallet(pack,[x,0,1.5]);carton(pack,[x-.31,.235,1.5],[.53,.55,.78]);carton(pack,[x+.31,.235,1.5],[.53,.55,.78]);}
  const packing=bench(pack,[0,0,-1.23],3.8,.65,'oak');sheets(packing,[-1.3,1.045,0]);carton(packing,[1.1,1.04,0],[.52,.37,.5]);ring(packing,.1,.035,'wood',[-.65,1.145,0],[0,0,0]);
  shelf(store,[0,0,-.9],5.6,'carton');const palletBase=pallet(store,[-1.3,0,1.2]);for(let k=0;k<2;k++)for(const x of [-.32,.32])carton(palletBase,[x,.235+k*.5,0],[.59,.49,.88]);
  const jack=group('Pallet trolley',store,[1.4,0,1.0]);for(const x of [-.25,.25]){b(jack,[.14,.065,1.18],'teal',[x,.1,0]);cylinder(jack,.095,.1,'rubber',[x,.1,-.36]).rotation.z=Math.PI/2;}tube(jack,[[0,.1,-.4],[0,1.0,-.65],[.25,1.12,-.65],[.25,.93,-.65]],.027,'navy');
 }else if(id==='china'){
  const [inspire,design]=bays[0];b(inspire,[5.15,1.7,.08],'linen',[0,2.12,-1.79]);frame(inspire,[0,2.12,-1.73],5.15,1.7,'oak');swatches(inspire,[-2.12,1.56,-1.68],3,6);for(let k=0;k<3;k++){b(inspire,[1,.48,.023],'white',[1.1,1.55+k*.52,-1.67]);tube(inspire,[[.75,1.53+k*.52,-1.65],[.95,1.65+k*.52,-1.65],[1.2,1.5+k*.52,-1.65],[1.48,1.69+k*.52,-1.65]],.012,'navy');}const it=bench(inspire,[0,0,.5],4.7,1.4,'oak');books(it,[-2,1.04,-.2],8);sheets(it,[.2,1.04,0]);vase(it,[1.8,1.04,.05],.55);
  const dt=bench(design,[0,0,.1],5.1,1.55);for(const x of [-1.4,1.4]){tablet(dt,[x,1.08,-.35],1.1,['FORM / COLOUR','DESIGN STUDY'],{kind:x<0?'form':'materials'});b(dt,[.7,.022,.25],'navy',[x,1.06,.34]);sheets(dt,[x+.45,1.04,.1]);chair(design,[x,0,1.7],Math.PI,'sage');}turntable(dt,'compact',[0,1.034,0],.37,.27,30);board(design,['IDEAS → FORM → DETAIL'],5.2);
  const [materials,lab]=bays[1];b(materials,[5.5,2.05,.08],'navy',[0,2,-1.78]);swatches(materials,[-2.35,1.3,-1.7],4,14);const mt=bench(materials,[0,0,.6],4.9,1.2,'oak');for(let i=0;i<8;i++){const t=b(mt,[.39,.035,.5],['oak','brass','rose','linen','teal','ivory','navy','lilac'][i],[-1.9+i*.54,1.057,0]);t.rotation.y=.14;}sheets(mt,[1.4,1.09,.32]);
  const lt=bench(lab,[0,0,.2],4.6,1.5);for(let i=0;i<3;i++){b(lt,[.85,.045,.62],'navy',[-1.3+i*1.3,1.06,0]);sphere(lt,.22,['ivory','rose','teal'][i],[-1.3+i*1.3,1.3,0]);}lamp(lt,[-1.9,1.04,-.3]);tablet(lt,[1.8,1.08,-.35],.9,['COMPARE'],{kind:'materials',offset:2});board(lab,['COLOUR / MATERIAL / FINISH']);
  const [proto,review]=bays[2],pt=bench(proto,[0,0,.3],5,1.55);const machine=group('Concept prototype printer',pt,[-1.3,1.04,-.05]);b(machine,[1.35,.12,1.1],'navy',[0,.08,0]);for(const x of [-.61,.61])for(const z of [-.48,.48])b(machine,[.08,1.65,.08],'steel',[x,.87,z]);b(machine,[1.35,.09,1.1],'navy',[0,1.72,0]);for(const x of [-.64,.64])b(machine,[.012,1.5,.97],'glass',[x,.87,0],0);b(machine,[1.15,.045,.035],'steel',[0,1.24,0]);const printHead=tagAmbient(group('Prototype printer carriage',machine),{kind:'printer',period:9});b(printHead,[.2,.25,.22],'navy',[0,1.1,0]);cylinder(printHead,.025,.09,'brass',[0,.94,0]);for(const z of [-.14,.14]){b(machine,[1.14,.028,.028],'steel',[0,1.22,z]);cylinder(printHead,.036,.12,'steel',[0,1.2,z]).rotation.z=Math.PI/2;}ring(machine,.2,.025,'navy',[-.86,1.24,0],[0,Math.PI/2,0]);for(let n=0;n<5;n++)ring(machine,.17,.014,'ivory',[-.89+n*.016,1.24,0],[0,Math.PI/2,0]);tube(machine,[[-.83,1.41,0],[-.6,1.84,0],[0,1.78,0]],.009,'ivory');b(machine,[1.12,.05,.07],'navy',[0,1.78,0]);tube(printHead,[[0,1.76,0],[.055,1.57,.04],[0,1.2,0]],.009,'ivory');const printBed=tagAmbient(group('Y-axis printer bed',machine),{kind:'printerBed',period:9});
  for(const x of [-.38,.38])b(machine,[.025,.04,1.04],'steel',[x,.28,0]);
  b(printBed,[.96,.04,.75],'stone',[0,.32,0]);
  const contour=Array.from({length:65},(_,i)=>{const c=printContour(i/64*9);return [c.x,0,c.z];});
  const layerShape=new T.TubeGeometry(new T.CatmullRomCurve3(contour.slice(0,-1).map(v=>new T.Vector3(...v)),true),96,.013,6,true);
  for(let layer=0;layer<22;layer++)a.mesh(printBed,layerShape,layer%5?'teal':'sage',[0,.353+layer*.025,0]);
  for(let i=0;i<3;i++)sample(pt,['rings','compact','serum'][i],[.35+i*.64,1.04,0],.4);sheets(pt,[.5,1.045,.53]);
  const rt=bench(review,[0,0,.3],4.7,1.5,'oak');for(let i=0;i<3;i++){turntable(rt,['serum','compact','rings'][i],[-1.4+i*1.4,1.034,0],.53,.32,32+i*4);}board(review,['MODEL / SAMPLE / DEVELOPMENT']);drawer(review,[-2.6,0,-1]);books(rt,[-2.1,1.04,.34],4);
 }else{
  const [retail,proposal]=bays[0];shelf(retail,[0,0,-.9],5.4);for(let i=0;i<3;i++){const x=-1.6+i*1.6;cylinder(retail,.53,.64,'ivory',[x,.37,.85]);cylinder(retail,.55,.035,'brass',[x,.705,.85]);const platter=poweredPlatter(a,retail,[x,.724,.85],{radius:.46,period:33+i*4});sample(platter,['compact','rings','lipstick'][i],[0,0,0],.57);}const pr=bench(proposal,[0,0,.45],4.8,1.55,'wood');sheets(pr,[-1.8,1.04,.05]);for(let i=0;i<3;i++){b(pr,[.76,.025,.69],'linen',[-.6+i*1.05,1.05,0]);sample(pr,['serum','compact','rings'][i],[-.6+i*1.05,1.08,0],.4);}board(proposal,['CONTEXT / PROPOSAL / FEEDBACK']);
  const [meeting,coCreate]=bays[1];sofa(meeting,[0,0,-.8],0,'linen');for(const x of [-1.8,1.8])chair(meeting,[x,0,1.3],Math.PI,'navy');const meet=bench(meeting,[0,0,.45],2.7,.85,'wood');meet.scale.y=.66;books(meet,[-1,1.04,0],5);sample(meet,'compact',[.55,1.04,0],.3);board(meeting,['PARTNERS']);const partnerNames=group('Confirmed partnership names',meeting,[0,0,0]);for(const [i,names] of [['合作示例 1','Example partner 1'],['合作示例 2','Example partner 2'],['合作示例 3','Example partner 3']].entries())sign(partnerNames,names,[(i-1)*1.55,1.71,-1.66],1.4,.23);target(partnerNames,{type:'resource',id:'partners'});
  const co=bench(coCreate,[0,0,.55],4.2,1.3);tablet(co,[1.2,1.08,-.2],1,['REQUIREMENTS','NEXT STEPS'],{kind:'connections'});sheets(co,[-1,1.04,0]);b(coCreate,[5.1,1.45,.06],'navy',[0,2.24,-1.78]);for(let i=0;i<3;i++){sign(coCreate,[['需求','方案','下一步'][i],['NEEDS','PROPOSALS','NEXT'][i]],[-1.65+i*1.65,2.68,-1.73],1.3,.3,{colour:'#eee5d1'});for(let n=0;n<3;n++){b(coCreate,[1.24,.2,.015],n%2?'ivory':'linen',[-1.65+i*1.65,2.3-n*.27,-1.73]);b(coCreate,[.81,.012,.007],'stone',[-1.7+i*1.65,2.3-n*.27,-1.714]);}}
  const [team,connect]=bays[2],tt=bench(team,[0,0,.1],5,1.55,'wood');for(const x of [-1.3,1.3]){tablet(tt,[x,1.08,-.35],1.1,['LOCAL / CONNECT'],{kind:'connections',offset:x<0?0:3});b(tt,[.72,.025,.28],'navy',[x,1.06,.36]);chair(team,[x,0,1.75],Math.PI,'sage');}books(tt,[-.35,1.04,.05],5);board(team,['MARKET / TEAM / PRODUCT']);
  const cb=bench(connect,[0,0,.5],4.2,1.45);sample(cb,'serum',[-1.2,1.04,0],.5);sheets(cb,[.1,1.04,0]);tablet(cb,[1.3,1.08,-.3],.9,['COORDINATION'],{kind:'connections',offset:1.5});b(connect,[5.2,1.5,.07],'navy',[0,2.28,-1.77]);for(let i=0;i<3;i++){const x=-1.65+i*1.65;ring(connect,.25,.023,'brass',[x,2.37,-1.71],[0,0,0]);sign(connect,[[ '中国','美国','柬埔寨'][i]],[x,1.96,-1.7],1.35,.27,{colour:'#eee5d1'});}tube(connect,[[-1.4,2.37,-1.7],[0,2.65,-1.7],[1.4,2.37,-1.7]],.015,'teal');
 }
 return a;
}
