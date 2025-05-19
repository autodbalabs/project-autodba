import { writable, derived, get } from 'svelte/store';

function normalizePrefix(prefix) {
  const prefixParts = prefix.trim().split('/').filter(Boolean);
  return '/' + prefixParts.join('/');
}

function normalizePath(path) {
  return path.trim().split('/').filter(Boolean).join('/');
}

function joinPath(prefix, path) {
  const normalizedPrefix = normalizePrefix(prefix).replace(/\/$/, '');
  const normalizedPath = normalizePath(path);
  return normalizedPath ? normalizedPrefix + '/' + normalizedPath : normalizedPrefix;
}

class Router {
  constructor(prefix = '', path = '') {
    this.prefix = normalizePrefix(prefix);
    this.store = writable(normalizePath(path));
  }

  join(path) {
    return joinPath(this.prefix, path);
  }

  fullpath() {
    return this.join(get(this.store));
  }

  navigate(path) {
    this.store.set(normalizePath(path));
  }

  isCurrentRoute(path) {
    return derived(this.store, $path => {
      return this.join($path) === this.join(path);
    });
  }

  isCurrentRoutePrefix(prefix) {
    return derived(this.store, $path => {
      return this.join($path).startsWith(this.join(prefix));
    });
  }

  onRouteChanged(callback) {
    return this.store.subscribe(value => {
      callback({
        path: value,
        fullPath: this.join(value)
      });
    });
  }

  scope(prefix) {
    const normalizedPrefix = this.join(prefix);
    const currentPath = this.fullpath();

    const path = currentPath.startsWith(normalizedPrefix + '/') 
      ? currentPath.slice(normalizedPrefix.length + 1)
      : '';

    const scopedRouter = new ScopedRouter(this, normalizedPrefix, path);

    return scopedRouter;
  }
}

class ScopedRouter extends Router {
  constructor(parent, prefix, path) {
    super(prefix, path);

    this.parent = parent;
    this.parent.store.subscribe(value => {
      this.store.set(value.slice(this.prefix.length));
    });
  }

  navigate(path) {
    this.parent.navigate(this.join(path));
  }
}

const router = new Router();

export default router;
