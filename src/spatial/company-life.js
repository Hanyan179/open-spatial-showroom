import { loadConfiguration, fetchJson, webUrl } from './resource-client.js';

// Asset paths are relative to the feed, so an API can host its own media.
export function normalizeCompanyLife(value, base) {
  if (!value || !Array.isArray(value.photos) || !Array.isArray(value.videos)) throw Error('Invalid company life feed');
  const ids = new Set();
  const list = kind => value[kind].map(item => {
    const src = webUrl(item.src, base),
      poster = item.poster ? webUrl(item.poster, base) : null;
    if (!item.id || ids.has(item.id) || !src || item.poster && !poster) throw Error('Invalid or duplicate company media');
    ids.add(item.id);
    return {
      ...item,
      src,
      poster
    };
  });
  return {
    photos: list('photos'),
    videos: list('videos')
  };
}
export async function loadCompanyLife(signal) {
  const config = await loadConfiguration(),
    url = webUrl(config.content.lifeUrl);
  return normalizeCompanyLife(await fetchJson(url, {
    ...config.requests,
    signal
  }), url);
}
export { localized as mediaText } from './core/i18n.js';
export function containedSize(width, height, frameWidth, frameHeight) {
  const scale = Math.min(frameWidth / Math.max(1, width), frameHeight / Math.max(1, height));
  return [width * scale, height * scale];
}
export function nextPlayableIndex(length, current, failed) {
  for (let step = 1; step <= length; step++) {
    const next = (current + step) % length;
    if (!failed.has(next)) return next;
  }
  return -1;
}
