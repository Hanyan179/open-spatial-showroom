import { smooth, wrap } from './process-motion.js';

// A closed demonstration conveyor. Every parcel has a continuous, supported
// return path; a cycle boundary never teleports or replaces a visible parcel.
export const COLLECTION={halfStraight:1.5,radius:.56,period:22,parcelLength:.48,trayLength:.56};
export const COLLECTION_LENGTH=6+Math.PI*2*COLLECTION.radius;

export function collectionTrack(distance) {
  const {halfStraight:a,radius:r}=COLLECTION,s=wrap(distance,COLLECTION_LENGTH),turn=Math.PI*r;
  if(s<2*a)return {x:-a+s,z:r,yaw:0};
  if(s<2*a+turn){const t=(s-2*a)/r;return {x:a+r*Math.sin(t),z:r*Math.cos(t),yaw:t};}
  if(s<4*a+turn)return {x:a-(s-2*a-turn),z:-r,yaw:Math.PI};
  const t=(s-4*a-turn)/r;return {x:-a-r*Math.sin(t),z:-r*Math.cos(t),yaw:Math.PI+t};
}

export function collectionParcel(index,time) {
  const {period}=COLLECTION,p=wrap(time,period),lap=Math.floor(time/period);
  const start=COLLECTION_LENGTH-1.2-index*.95,stop=2.4-index*.9;
  const gathered=COLLECTION_LENGTH+stop,end=COLLECTION_LENGTH+start;
  let distance=start;
  if(p<12.3)distance+=(gathered-start)*smooth((p-index*2)/5);
  else distance=gathered+(end-gathered)*smooth((p-12.3)/9.2);
  distance+=lap*COLLECTION_LENGTH;
  return {distance,...collectionTrack(distance)};
}

export function collectionGate(index,time) {
  const p=wrap(time,COLLECTION.period);
  if(p>=11.6&&p<=12.1)return 1-smooth((p-11.6)/.5);
  if(p>12.1)return index===0?smooth((p-21.55)/.4):0;
  return index===0?1:smooth((p-(5+(index-1)*2+.1))/.4);
}

export function collectionStage(time) {
  const p=wrap(time,COLLECTION.period);
  return p<9?'gather':p<11.6?'hold':p<12.3?'open':p<16?'dispatch':'return';
}
