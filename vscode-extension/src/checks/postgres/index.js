const ConfigSuggestionsCheck = require('./config_suggestions_check');
const SlowQueriesCheck = require('./slow_queries_check');
const IndexAuditCheck = require('./index_audit_check');
const ConnectionCheck = require('./connection_check');
const { registerCheck } = require('../../utils/check_registry');

// Register all PostgreSQL checks
registerCheck('postgresql', ConnectionCheck);
registerCheck('postgresql', IndexAuditCheck);
registerCheck('postgresql', SlowQueriesCheck);
registerCheck('postgresql', ConfigSuggestionsCheck);

module.exports = {
  ConfigSuggestionsCheck,
  IndexAuditCheck,
  SlowQueriesCheck,
  ConnectionCheck
};
