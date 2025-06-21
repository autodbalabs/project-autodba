const registry = new Map();

/**
 * Register a check for a specific database kind.
 * Check classes should expose a static `id` property for easy lookup.
 *
 * @param {string} kind
 * @param {Function} CheckClass
 */
function registerCheck(kind, CheckClass) {
  const id = CheckClass.id || CheckClass.name;
  if (!registry.has(kind)) {
    registry.set(kind, new Map());
  }
  registry.get(kind).set(id, CheckClass);
}

/**
 * Get check classes for a kind. When an array of ids is supplied only those
 * checks will be returned.
 *
 * @param {string} kind
 * @param {Array<string>} [ids]
 * @returns {Array<Function>}
 */
function getChecks(kind, ids = null) {
  const checks = registry.get(kind) || new Map();
  if (!ids) {
    return Array.from(checks.values());
  }
  return ids
    .map(id => checks.get(id))
    .filter(Boolean);
}

/**
 * List available check identifiers for a given kind.
 *
 * @param {string} kind
 * @returns {Array<string>}
 */
function listCheckIds(kind) {
  return Array.from((registry.get(kind) || new Map()).keys());
}

module.exports = {
  registerCheck,
  getChecks,
  listCheckIds
};
