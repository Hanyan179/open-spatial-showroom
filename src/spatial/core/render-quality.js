// Render budgets are independent from the responsive UI's CSS dimensions.
export const QUALITY_PROFILES = [
  { id:'smooth', name:['流畅','Smooth'], description:['降低绘制负担，适合普通展示电脑','Lower rendering load for everyday display computers'], minRatio:1, maxRatio:1, pixels:2073600, shadow:2048, regionalShadow:2048, reflection:768, anisotropy:4 },
  { id:'clear', name:['清晰 · 推荐','Clear · Recommended'], description:['优先大屏清晰度与连续移动','Sharp large-screen output with continuous movement'], minRatio:1.25, maxRatio:2, pixels:8294400, shadow:4096, regionalShadow:4096, reflection:1536, anisotropy:8 },
  { id:'detail', name:['精细','Detailed'], description:['提高边缘与镜面精度，适合高性能电脑','Finer edges and mirrors for higher-performance computers'], minRatio:1.5, maxRatio:2, pixels:14745600, shadow:4096, regionalShadow:4096, reflection:2048, anisotropy:16 }
];
export const qualityProfile = id => QUALITY_PROFILES.find(p=>p.id===id) || QUALITY_PROFILES[1];
export function drawingSize(width,height,dpr,id,maxTextureSize=16384) {
  const p=qualityProfile(id),w=Math.max(1,width),h=Math.max(1,height);
  const ratio=Math.min(Math.max(p.minRatio,Number(dpr)||1),p.maxRatio,Math.sqrt(p.pixels/(w*h)),maxTextureSize/w,maxTextureSize/h);
  return {width:Math.max(1,Math.floor(w*ratio)),height:Math.max(1,Math.floor(h*ratio)),ratio};
}
