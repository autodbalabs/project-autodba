const ConfigSuggestionsCheck = require('./config_suggestions_check');
const SlowQueriesCheck = require('./slow_queries_check');
const IndexAuditCheck = require('./index_audit_check');
const ConnectionCheck = require('./connection_check');
const { registerCheck } = require('../../utils/check_registry');

function registerChecks(identifier) {
  registerCheck('postgresql', identifier, ConnectionCheck);
  registerCheck('postgresql', identifier, IndexAuditCheck);
  registerCheck('postgresql', identifier, SlowQueriesCheck);
  registerCheck('postgresql', identifier, ConfigSuggestionsCheck);
}

module.exports = {
  registerChecks,
  ConfigSuggestionsCheck,
  IndexAuditCheck,
  SlowQueriesCheck,
  ConnectionCheck
};
