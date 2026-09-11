import company from '../../../public/data/company.json' with { type: 'json' };
import resources from '../../../public/data/resources.json' with { type: 'json' };

// Sculpture heights express successive chapters, never actual floor counts or size.
export function companyGallery(a) {
  const { root, group, box, cylinder, ring, tube, sign, target } = a;
  const gallery = group('Company story and partner installations', root, [8.78, 0, 7]);
  gallery.rotation.y = -Math.PI / 2;
  box(gallery, [5.7, 3.36, .12], 'navy', [0, 1.87, 0], .04);
  for (const x of [-2.84, -.05, 2.84]) box(gallery, [.045, 3.25, .075], 'brass', [x, 1.87, .1], .012);
  box(gallery, [5.65, .045, .13], 'light', [0, 3.57, .08], .008);
  for (const [name,x] of [['partners',-1.43],['milestones',1.42]]) {
    const icon = group('Gallery pictogram · '+name, gallery, [x,3.1,.14]);
    icon.userData.icon = {name, tone:'ivory', width:.36};
  }
  const history = group('A skyline of documented milestones', gallery, [1.4, 0, .2]);
  target(history, {type:'company',id:'history'});
  box(history, [2.6,.57,.78], 'stone', [0,.34,.38], .045);
  box(history, [2.67,.07,.84], 'ivory', [0,.66,.38], .025);
  box(history, [2.42,.05,.61], 'brass', [0,.052,.36], .012);
  tube(history, [[-1.2,.704,.7],[-.8,.704,.73],[0,.704,.73],[.8,.704,.73],[1.2,.704,.7]], .012,'brass');
  company.history.forEach((entry,i,all) => {
    const x=(i-(all.length-1)/2)*.415, h=.48+i*.225, w=.31, d=.34;
    const tower=group('Milestone building · '+entry.year,history,[x,.72,.4]);
    tower.userData.milestone={year:entry.year,index:i,height:h,width:w,depth:d};
    target(tower,{type:'company',id:'history',year:entry.year});
    box(tower,[w,h,d],i%2?'steel':'blue',[0,h/2,0],.018);
    for(const z of [-d/2-.005,d/2+.005]) {
      box(tower,[w-.045,h-.085,.012],'ink',[0,h/2,z],.004);
      for(const column of [-1,0,1]) box(tower,[.01,h-.045,.02],'brass',[column*.096,h/2,z+.005],.002);
    }
    const floors=Math.max(3,Math.floor(h/.13));
    for(let k=0;k<=floors;k++) box(tower,[w+.025,.018,d+.025],'ivory',[0,.035+k*(h-.05)/floors,0],.004);
    box(tower,[w*.72,.095,d*.72],'stone',[0,h+.036,-.02],.008);
    box(tower,[w*.6,.013,d*.61],'brass',[0,h+.089,-.02],.003);
    box(tower,[.083,.15,.016],'glass',[.065,.081,d/2+.017],.003);
    box(tower,[.14,.017,.09],'brass',[.052,.163,d/2+.03],.004);
    if(i>2) cylinder(tower,.006,.15+i*.013,'brass',[0,h+.15,-.06]);
    const year=group('Milestone date · '+entry.year,history,[x,.48,.786]);
    target(year,{type:'company',id:'history',year:entry.year});
    box(year,[.385,.22,.023],'navy',[0,0,0],.012);
    sign(year,[String(entry.year)],[0,0,.02],.345,.13,{colour:'#f1e6d2'});
  });
  const partners=group('Three dimensional partner gallery',gallery,[-1.45,0,.18]);
  target(partners,{type:'resource',id:'partners'});
  box(partners,[2.53,.48,.76],'stone',[0,.29,.36],.045);
  box(partners,[2.61,.055,.83],'ivory',[0,.557,.36],.02);
  box(partners,[2.33,.06,.61],'brass',[0,.055,.35],.01);
  const trail=ring(partners,.88,.014,'brass',[0,.596,.36]);trail.scale.y=.25;
  const positions=[[-.67,1.91,.45],[.47,2.55,.26],[.49,1.22,.54]];
  resources.partners.slice(0,3).forEach((p,i)=>{
    const [x,y,z]=positions[i], w=i===0?.93:1.13, h=i===0?1.04:.58;
    const stand=group('Partner identity display · '+p.id,partners,[x,0,z]);
    target(stand,{type:'resource',id:'partners',partner:p.id});
    cylinder(stand,.025,y-h/2-.58,'brass',[0,(y-h/2+.58)/2,0]);
    cylinder(stand,.14,.025,'brass',[0,.59,0]);
    box(stand,[w+.06,h+.06,.09],'brass',[0,y,0],.035);
    box(stand,[w,h,.05],'ivory',[0,y,.052],.023);
    box(stand,[w-.08,.014,.016],'light',[0,y-h/2+.028,.091],.003);
    const image=group('Source partner identity · '+p.id,stand,[0,y,.085]);
    image.userData.partnerReference={id:p.id,w:w*.82,h:h*.72};
    sign(image,[p.name.en],[0,0,0],w*.82,.16,{colour:'#1c3448',i18n:{zh:[p.name.zh],en:[p.name.en]}});
  });
  box(root,[.035,.004,5.7],'brass',[7.62,.012,7],0);
}
