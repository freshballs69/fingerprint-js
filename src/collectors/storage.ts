export function hasSessionStorage(): boolean {
  try {
    return !!window.sessionStorage;
  } catch {
    return false;
  }
}

export function hasLocalStorage(): boolean {
  try {
    return !!window.localStorage;
  } catch {
    return false;
  }
}

export function hasIndexedDb(): boolean {
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
}
