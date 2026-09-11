import { categoriesFor } from '../core/product-categories.js';
// Two complementary category stations, separate from the central demonstration stands.
export function categoryWall(a, domain) {
  const {root,group,box,cylinder,sphere,ring,tube,products,target,cabinet}=a;
  for(const c of categoriesFor(domain).filter(c=>c.wall)) {
    const bay=group('Category wall · '+c.id,root,[8.65,0,c.wall.z]);bay.rotation.y=-Math.PI/2;
    target(bay,{type:'roomProducts',id:c.wall.product,category:c.id});
    box(bay,[2.68,2.9,.055],'ivory',[0,2.12,-.31],.025);
    for(const x of [-1.32,1.32])box(bay,[.025,2.9,.035],'brass',[x,2.12,-.269],.005);
    cabinet(bay,0,0,2.68,domain==='play'?'oak':domain==='party'?'lilac':'blush');
    products.label(bay,...c.name,[0,2.8,-.25],2.4,.28);
    products.label(bay,'按类浏览产品','BROWSE THIS CATEGORY',[0,.61,.344],2,.17);
    const sample=group('Category display interpretation',bay,[-.57,1.0,0]);
    const shape=c.wall.shape;
    if(shape==='brushes') {
      cylinder(sample,.18,.29,'brass',[0,.15,0]);
      for(let i=0;i<5;i++){const b=group('Brush handle and ferrule',sample,[(i-2)*.075,.2,0]);b.rotation.z=(i-2)*-.08;cylinder(b,.016,.56,'navy',[0,.29,0]);cylinder(b,.024,.12,'brass',[0,.61,0]);sphere(b,.065,'wood',[0,.74,0],[.65,1.65,.6]);}
    } else if(shape==='sponges') {
      box(sample,[.83,.04,.57],'stone',[0,.03,0],.02);
      for(let i=0;i<3;i++)sphere(sample,.17,['rose','linen','lilac'][i],[-.24+i*.24,.2,0],[.85,1.2,.5]);
    } else if(shape==='puzzles') {
      box(sample,[.96,.68,.08],'wood',[0,.4,-.07],.02);
      for(let r=0;r<3;r++)for(let col=0;col<4;col++) {const x=-.33+col*.22,y=.17+r*.21;box(sample,[.205,.195,.045],['teal','yellow','rose','sage'][(r+col)%4],[x,y,-.01],.018);sphere(sample,.033,'ivory',[x+.10,y,.03],[1,1,.3]);}
      box(sample,[.22,.04,.19],'yellow',[.18,.06,.25],.01);
    } else if(shape==='science') {
      const detector=group('Detector interpretation',sample);detector.rotation.z=-.2;
      tube(detector,[[0,.14,.12],[0,.8,0],[0,1.2,0]],.025,'steel');ring(detector,.22,.03,'navy',[0,.12,.12]);box(detector,[.21,.22,.11],'navy',[0,.85,.035],.02);box(detector,[.15,.1,.009],'teal',[0,.88,.095],.006);cylinder(detector,.055,.22,'rubber',[0,1.13,0]);
    } else if(shape==='tableware') {
      for(let i=0;i<4;i++){cylinder(sample,.16,.25,'ivory',[-.22+i*.13,.135+i*.026,0],.205);ring(sample,.2,.012,'brass',[-.22+i*.13,.26+i*.026,0]);}
      for(let i=0;i<5;i++){const straw=cylinder(sample,.012,.47,['rose','sage','yellow'][i%3],[.33+i*.032,.36,.05]);straw.rotation.z=-.18;}
    } else if(shape==='napkins') {
      for(let i=0;i<7;i++){const n=box(sample,[.66,.015,.66],'linen',[0,.04+i*.018,0],.006);n.rotation.y=i*.035;}
      box(sample,[.56,.035,.25],'navy',[0,.20,0],.008);
      for(let i=0;i<4;i++)sphere(sample,.029,'ivory',[-.19+i*.13,.225,0],[1,.2,1]);
    }
    const photo=group('Category source reference',bay,[.68,1.69,.04]);
    box(photo,[.82,1.07,.035],'stone',[0,0,0],.02);
    const mount=group('PRODUCT category source image',photo,[0,0,.025]);mount.userData.productReference={id:c.wall.product,w:.76,h:1};
  }
}
