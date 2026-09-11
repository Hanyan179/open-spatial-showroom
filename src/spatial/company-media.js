import * as T from 'three';
import {loadCompanyLife,containedSize,nextPlayableIndex} from './company-life.js';

// A cached room owns its players. Hidden rooms and content overlays never play audio/video.
export function createCompanyMedia(root){
 const mounts=[];root.traverse(o=>{if(o.userData.mediaSurface)mounts.push(o);});
 if(!mounts.length)return null;
 const abort=new AbortController(),surfaces=[],loader=new T.TextureLoader(),failedVideos=new Set(),issues=new Set();
 let disposed=false,dirty=true,playing=false,video=null,videoTexture=null,videoSurface=null,playlist=[],index=0,blocked=false,playPending=false;
 const state={status:'loading',photos:0,videos:0,playing:false};
 function makeSurface(mount){
  const spec=mount.userData.mediaSurface,placeholder=[...mount.children];
  const material=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
  const mesh=new T.Mesh(new T.PlaneGeometry(1,1),material);mesh.position.z=.008;mesh.visible=false;mount.add(mesh);
  const surface={mount,spec,mesh,placeholder};surfaces.push(surface);return surface;
 }
 function display(surface,texture,width,height){
  if(disposed){texture.dispose();return;}
  texture.colorSpace=T.SRGBColorSpace;surface.mesh.material.map=texture;surface.mesh.material.needsUpdate=true;
  const [w,h]=containedSize(width,height,surface.spec.w,surface.spec.h);surface.mesh.scale.set(w,h,1);surface.mesh.visible=true;
  surface.placeholder.forEach(o=>{o.visible=false;});dirty=true;
 }
 function hideVideo(){if(videoSurface){videoSurface.mesh.visible=false;videoSurface.placeholder.forEach(o=>{o.visible=true;});dirty=true;}}
 function nextVideo(){
  if(disposed||!playlist.length)return;
  video.pause();hideVideo();blocked=false;video.src=playlist[index].src;video.load();
 }
 function resume(){
  if(!video||!playing||blocked||playPending||!video.paused||video.readyState<2)return;
  playPending=true;video.play().then(()=>{if(!playing||disposed)video.pause();}).catch(error=>{if(disposed||!playing||error.name==='AbortError')return;blocked=true;state.status='playback-unavailable';}).finally(()=>{playPending=false;});
 }
 loadCompanyLife(abort.signal).then(data=>{
  if(disposed)return;state.status='ready';state.photos=data.photos.length;state.videos=data.videos.length;dirty=true;
  for(const mount of mounts){
   const spec=mount.userData.mediaSurface;
   if(spec.kind==='photo'&&data.photos[spec.slot]){
    const item=data.photos[spec.slot],surface=makeSurface(mount);mount.userData.action={type:'life',kind:'photos',index:spec.slot,at:'culture'};
    loader.load(item.src,texture=>display(surface,texture,texture.image.width,texture.image.height),undefined,()=>{if(!disposed){issues.add(item.id);state.status='media-unavailable';dirty=true;}});
   }else if(spec.kind==='video'&&data.videos.length){
    playlist=data.videos;videoSurface=makeSurface(mount);video=document.createElement('video');video.crossOrigin='anonymous';video.muted=true;video.playsInline=true;video.preload='auto';
    videoTexture=new T.VideoTexture(video);videoTexture.colorSpace=T.SRGBColorSpace;
    video.addEventListener('loadeddata',()=>{if(disposed)return;display(videoSurface,videoTexture,video.videoWidth,video.videoHeight);state.status=issues.size?'media-unavailable':'ready';resume();});
    video.addEventListener('ended',()=>{const next=nextPlayableIndex(playlist.length,index,failedVideos);if(next===index){video.currentTime=0;resume();}else if(next>=0){index=next;nextVideo();}});
    video.addEventListener('error',()=>{if(disposed)return;failedVideos.add(index);issues.add(playlist[index].id);state.status='media-unavailable';hideVideo();const next=nextPlayableIndex(playlist.length,index,failedVideos);if(next>=0){index=next;nextVideo();}else blocked=true;});nextVideo();
   }
  }
 }).catch(error=>{if(!disposed&&error.name!=='AbortError'){state.status='feed-unavailable';dirty=true;}});
 return {
  state,
  pause(){playing=false;state.playing=false;video?.pause();},
  update(enabled){
   if(enabled!==playing){playing=enabled;blocked=false;}
   if(enabled)resume();else video?.pause();state.playing=Boolean(video&&!video.paused);
   const changed=dirty||state.playing;dirty=false;return changed;
  },
  dispose(){disposed=true;abort.abort();video?.pause();if(video){video.removeAttribute('src');video.load();}videoTexture?.dispose();}
 };
}
