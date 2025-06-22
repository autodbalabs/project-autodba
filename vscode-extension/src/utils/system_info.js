const os = require('os');
const fs = require('fs');

function getCpuCount() {
  try {
    return os.cpus().length;
  } catch (e) {
    return 0;
  }
}

function getTotalMemoryBytes() {
  try {
    return os.totalmem();
  } catch (e) {
    return 0;
  }
}

function detectStorageType() {
  try {
    const blockDir = '/sys/block';
    const devices = fs.readdirSync(blockDir);
    for (const dev of devices) {
      const rotationalPath = `${blockDir}/${dev}/queue/rotational`;
      if (fs.existsSync(rotationalPath)) {
        const val = fs.readFileSync(rotationalPath, 'utf8').trim();
        if (val === '0') {
          return 'SSD';
        }
      }
    }
    return 'HDD';
  } catch (e) {
    return 'unknown';
  }
}

module.exports = { getCpuCount, getTotalMemoryBytes, detectStorageType };
