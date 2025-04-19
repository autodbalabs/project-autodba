const ConfigSuggestionsCheck = require('./config_suggestions_check');
const SlowQueriesCheck = require('./slow_queries_check');
const IndexAuditCheck = require('./index_audit_check');

module.exports = {
  ConfigSuggestionsCheck,
  IndexAuditCheck,
  SlowQueriesCheck
};
