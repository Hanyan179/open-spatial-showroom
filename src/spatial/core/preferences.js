// Storage can be unavailable in restricted browsers; that must not break navigation.
export function readPreference(key, fallback) {
  try {
    return JSON.parse(sessionStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writePreference(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {/* Session still works in memory. */}
}
