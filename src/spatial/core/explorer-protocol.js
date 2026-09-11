export const EXPLORER_CHANNEL = 'showroom-explorer';
export const EXPLORER_VERSION = 1;
export function isExplorerMessage(event, source, origin) {
  return Boolean(source && event.source === source && event.origin === origin &&
    event.data?.channel === EXPLORER_CHANNEL && event.data.version === EXPLORER_VERSION);
}
// Ignore the child's initial / stale echo until it acknowledges the host's language.
export class LanguageHandshake {
  constructor() { this.ready = false; this.expected = null; }
  expect(language) { this.expected = language; }
  accept(language) {
    if (!this.ready || !['zh','en'].includes(language)) return false;
    if (this.expected && this.expected !== language) return false;
    this.expected = null;
    return true;
  }
  reset() { this.ready = false; this.expected = null; }
}
