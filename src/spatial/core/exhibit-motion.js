// Physical exhibition mechanisms. Angles are local to the fixed shaft, in radians.
export function exhibitAngle(spec,time) {
  const period=spec.period??28, a=time*Math.PI*2/period;
  if(spec.kind==='gear')return a*(spec.direction??1)*(16/(spec.teeth??16));
  if(spec.kind==='trackingAltitude')return .07*Math.sin(a);
  return (spec.amplitude??.32)*Math.sin(a);
}

// 20-degree involute flanks, slight backlash; meshing gears share a module.
export function gearOutline(teeth,module=.0275) {
  const pitch=teeth*module/2,base=pitch*Math.cos(Math.PI/9),tip=pitch+module,root=pitch-1.25*module;
  const involute=r=>{const t=Math.sqrt(Math.max(0,(r/base)**2-1));return t-Math.atan(t);};
  const half=Math.PI/(2*teeth)-.012,atPitch=involute(pitch),points=[];
  for(let tooth=0;tooth<teeth;tooth++) {
    const c=tooth*Math.PI*2/teeth;
    const flank=r=>half+atPitch-involute(r);
    const add=(r,a)=>points.push([r*Math.cos(a),r*Math.sin(a)]);
    add(root,c-flank(base));add(base,c-flank(base));
    for(let j=1;j<=5;j++){const r=base+(tip-base)*j/5;add(r,c-flank(r));}
    for(let j=0;j<=3;j++)add(tip,c-flank(tip)+2*flank(tip)*j/3);
    for(let j=4;j>=0;j--){const r=base+(tip-base)*j/5;add(r,c+flank(r));}
    add(root,c+flank(base));
  }
  return points;
}
