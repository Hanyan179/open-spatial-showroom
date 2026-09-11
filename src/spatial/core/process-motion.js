// Conceptual machine cycles, driven by the room clock, never by wall time.
const clamp = v => Math.max(0, Math.min(1, v));
export const smooth = v => { const t=clamp(v); return t*t*(3-2*t); };
export const wrap = (v, length) => ((v % length) + length) % length;

export function productionCycle(time, period=7) {
  const cycle=Math.floor(time/period), p=wrap(time/period,1);
  const feed=smooth(p/.22);
  const press=p<.32?0:p<.48?smooth((p-.32)/.16):p<.65?1:p<.8?1-smooth((p-.65)/.15):0;
  return {feed,press,travel:cycle+feed,stage:p<.22?'feed':p<.32?'locate':p<.65?'tool':'release'};
}

export function carrierPosition(spec,time) {
  const pitch=spec.pitch??1.8,span=pitch*(spec.count??3);
  return wrap(((spec.slot??0)+productionCycle(time,spec.period).travel)*pitch+span/2,span)-span/2;
}

// A closed rounded rectangle: a printer traces a contour, not an aimless oscillation.
export function printContour(time,period=9) {
  const a=time*Math.PI*2/period, c=Math.cos(a),s=Math.sin(a);
  return {x:.29*c/Math.sqrt(1-.7*s*s),z:.19*s/Math.sqrt(1-.7*c*c)};
}

export const inspectionOffset = time => .18*Math.sin(time*Math.PI/4);
