const fs = require('fs');

const resultsPath = 'test-results/results.json';

if (!fs.existsSync(resultsPath)) {
  console.error('Results file not found');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

const stats = data.stats;

const metrics = {
  passed: stats.expected || 0,
  failed: stats.unexpected || 0,
  skipped: stats.skipped || 0,
  flaky: stats.flaky || 0,
  duration_ms: Math.round(stats.duration || 0),
  total:
    (stats.expected || 0) +
    (stats.unexpected || 0) +
    (stats.skipped || 0)
};

console.log('Extracted metrics:', metrics);
