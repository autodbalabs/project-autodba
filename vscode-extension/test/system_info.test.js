const assert = require('assert');
const { getCpuCount, getTotalMemoryBytes, detectStorageType } = require('../src/utils/system_info');

describe('System Info Utility', () => {
  it('returns cpu count and memory', () => {
    assert.ok(getCpuCount() >= 0);
    assert.ok(getTotalMemoryBytes() >= 0);
    const type = detectStorageType();
    assert.ok(['SSD', 'HDD', 'unknown'].includes(type));
  });
});
