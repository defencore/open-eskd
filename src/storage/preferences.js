export function readPreference(key, value) {
  try {
    return localStorage.getItem(key) || value;
  } catch {
    return value;
  }
}
export function preference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences are optional in restricted browser sessions. */
  }
}
