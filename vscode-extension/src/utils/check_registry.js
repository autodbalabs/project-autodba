// registry maps kind -> identifier -> Map<id, CheckClass>
const registry = new Map();

/**
 * Register a check for a specific database kind.
 * Check classes should expose a static `id` property for easy lookup.
 *
 * @param {string} kind
 * @param {Function} CheckClass
 */
function registerCheck(kind, identifier, CheckClass) {
  const id = CheckClass.id || CheckClass.name;
  if (!registry.has(kind)) {
    registry.set(kind, new Map());
  }
  const kindMap = registry.get(kind);
  if (!kindMap.has(identifier)) {
    kindMap.set(identifier, new Map());
  }
  kindMap.get(identifier).set(id, CheckClass);
}

/**
 * Get check classes for a kind and optional identifier.
 * When identifier is provided only checks registered for that identifier
 * will be returned.
*
* @param {string} kind
* @param {string} [identifier]
* @returns {Array<Function>}
*/
function getChecks(kind, identifier = null) {
  const kindMap = registry.get(kind);
  if (!kindMap) return [];

  if (identifier) {
    const checks = kindMap.get(identifier);
    return checks ? Array.from(checks.values()) : [];
  }

  let result = [];
  for (const checks of kindMap.values()) {
    result = result.concat(Array.from(checks.values()));
  }
  return result;
}

module.exports = {
  registerCheck,
  getChecks
};
