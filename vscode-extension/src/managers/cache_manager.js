const vscode = require('vscode');

class CacheManager {
  /**
   * Create a new cache manager instance
   * @param {vscode.ExtensionContext} context - VSCode extension context
   * @param {number} cacheExpirationMs - Cache expiration duration in milliseconds (default: 1 day)
   * @param {boolean} debugMode - Whether to skip cache in debug mode
   */
  constructor(context, cacheExpirationMs = 24 * 60 * 60 * 1000, debugMode = false) {
    this.context = context;
    this.cache = new Map();
    this.cacheExpirationMs = cacheExpirationMs;
    this.debugMode = debugMode;
    this.loadCache();
  }

  /**
   * Loads the cache from VSCode storage
   */
  loadCache() {
    const storedCache = this.context.globalState.get('insights_cache') || {};
    for (const [key, value] of Object.entries(storedCache)) {
      this.cache.set(key, {
        ...value,
        lastCheckTime: value.lastCheckTime ? new Date(value.lastCheckTime) : null
      });
    }
  }

  /**
   * Saves the cache to VSCode storage
   */
  async saveCache() {
    const cacheToStore = {};
    for (const [key, value] of this.cache.entries()) {
      cacheToStore[key] = {
        ...value,
        lastCheckTime: value.lastCheckTime ? value.lastCheckTime.toISOString() : null
      };
    }
    await this.context.globalState.update('insights_cache', cacheToStore);
  }

  /**
   * Gets cached insights for a connection
   * @param {string} connectionName - Name of the connection
   * @returns {Object|null} Cached insights or null if not found/expired
   */
  getInsights(connectionName) {
    // Skip cache in debug mode
    if (this.debugMode) {
      console.log('Skipping cache in debug mode');
      return null;
    }

    const cached = this.cache.get(connectionName);
    if (!cached) return null;

    const now = new Date();
    if (cached.lastCheckTime && (now - cached.lastCheckTime) < this.cacheExpirationMs) {
      return cached.insights;
    }

    return null;
  }

  /**
   * Sets insights for a connection
   * @param {string} connectionName - Name of the connection
   * @param {Array} insights - Insights to cache
   */
  async setInsights(connectionName, insights) {
    this.cache.set(connectionName, {
      insights,
      lastCheckTime: new Date()
    });
    await this.saveCache();
  }

  /**
   * Clears cached insights for a connection
   * @param {string} connectionName - Name of the connection
   */
  async clearInsights(connectionName) {
    this.cache.delete(connectionName);
    await this.saveCache();
  }

  /**
   * Clears all cached insights
   */
  async clearAllInsights() {
    this.cache.clear();
    await this.saveCache();
  }
}

module.exports = CacheManager;
