const registry = new Map();

function registerCheck(kind, CheckClass) {
  if (!registry.has(kind)) {
    registry.set(kind, []);
  }
  registry.get(kind).push(CheckClass);
}

function getChecks(kind) {
  return registry.get(kind) || [];
}

module.exports = {
  registerCheck,
  getChecks
};
