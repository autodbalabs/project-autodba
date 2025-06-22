const assert = require('assert');
const sinon = require('sinon');

const ConnectionCheck = require('../src/checks/postgres/connection_check');
const IndexAuditCheck = require('../src/checks/postgres/index_audit_check');
const ConfigSuggestionsCheck = require('../src/checks/postgres/config_suggestions_check');
const SlowQueriesCheck = require('../src/checks/postgres/slow_queries_check');

class MockDb {
  constructor(results = []) {
    this.results = Array.from(results);
    this.calls = [];
    this.error = null;
  }
  async executeQuery(sql) {
    this.calls.push(sql.trim());
    if (this.error) {
      const err = this.error;
      this.error = null;
      throw err;
    }
    if (this.results.length > 0) {
      return this.results.shift();
    }
    return { rows: [] };
  }
  failOnce(err) {
    this.error = err instanceof Error ? err : new Error(err);
  }
}

describe('PostgreSQL Checks', () => {
  describe('ConnectionCheck', () => {
    it('passes when query succeeds', async () => {
      const db = new MockDb([{ rows: [{1:1}] }]);
      const check = new ConnectionCheck(db);
      const result = await check.validate();
      assert.strictEqual(result.length, 0);
      assert.ok(db.calls[0].includes('SELECT 1'));
    });

    it('fails when query throws', async () => {
      const db = new MockDb();
      db.failOnce(new Error('no connect'));
      const check = new ConnectionCheck(db);
      const result = await check.validate();
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].kind, 'connection-failed');
    });
  });

  describe('IndexAuditCheck', () => {
    it('generates insights for unused and redundant indexes', async () => {
      const db = new MockDb([
        { rows: [{ schemaname: 'public', relname: 't', indexrelname: 'idx', index_size: 10, index_definition: '', idx_scan: 0 }] },
        { rows: [{ schemaname: 'public', tablename: 't', redundant_index: 'idx2', covering_index: 'idx3' }] }
      ]);
      const check = new IndexAuditCheck(db);
      const result = await check.generateInsights();
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].kind, 'unused-index');
      assert.strictEqual(result[1].kind, 'redundant-index');
    });
  });

  describe('ConfigSuggestionsCheck', () => {
    it('suggests configuration changes', async () => {
      const configRows = [
        { name: 'shared_buffers', setting: '128' },
        { name: 'work_mem', setting: '1' },
        { name: 'maintenance_work_mem', setting: '16' },
        { name: 'wal_buffers', setting: '4' }
      ];
      const systemInfo = { rows: [{ max_connections: 10 }] };
      const db = new MockDb([{ rows: configRows }, systemInfo]);
      const check = new ConfigSuggestionsCheck(db);
      const stub = sinon.stub(require('os'), 'totalmem').returns(8 * 1024 * 1024 * 1024);
      const insights = await check.generateInsights();
      stub.restore();
      assert.ok(insights.length > 0);
      insights.forEach(i => assert.strictEqual(i.kind, 'config-optimization'));
    });
  });

  describe('SlowQueriesCheck', () => {
    it('produces insights for slow queries', async () => {
      const rows = [{
        query: 'SELECT * FROM t',
        calls: 5,
        total_time: 500,
        mean_time: 100,
        rows: 10,
        shared_blks_hit: 1,
        shared_blks_read: 1,
        shared_blks_written: 0,
        local_blks_hit: 0,
        local_blks_read: 0,
        local_blks_written: 0,
        temp_blks_read: 0,
        temp_blks_written: 0,
        blk_read_time: 0,
        blk_write_time: 0
      }];
      const db = new MockDb([{ rows }]);
      const check = new SlowQueriesCheck(db);
      const insights = await check.generateInsights();
      assert.strictEqual(insights.length, 1);
      assert.strictEqual(insights[0].kind, 'slow-query');
    });
  });
});
