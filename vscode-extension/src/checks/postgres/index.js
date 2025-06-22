const ConfigSuggestionsCheck = require('./config_suggestions_check');
const SlowQueriesCheck = require('./slow_queries_check');
const IndexAuditCheck = require('./index_audit_check');
const ConnectionCheck = require('./connection_check');
const { registerCheck, deregisterCheck } = require('../../utils/check_registry');

function registerChecks() {
  registerCheck('postgresql', ConnectionCheck);
  registerCheck('postgresql', IndexAuditCheck);
  registerCheck('postgresql', SlowQueriesCheck);
  registerCheck('postgresql', ConfigSuggestionsCheck);
}

function deregisterChecks() {
  deregisterCheck('postgresql', ConnectionCheck);
  deregisterCheck('postgresql', IndexAuditCheck);
  deregisterCheck('postgresql', SlowQueriesCheck);
  deregisterCheck('postgresql', ConfigSuggestionsCheck);
}

module.exports = {
  registerChecks,
  deregisterChecks,
  ConfigSuggestionsCheck,
  IndexAuditCheck,
  SlowQueriesCheck,
  ConnectionCheck
};
