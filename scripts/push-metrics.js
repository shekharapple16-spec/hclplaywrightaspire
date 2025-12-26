const fs = require('fs');
const https = require('https');
const url = require('url');
const path = require('path');
const protobuf = require('protobufjs');
const snappy = require('snappy');

// --- Configuration ---
const resultsPath = 'test-results/results.json';
const protoPath = path.join(__dirname, '../proto/remote.proto');

const promUrl = process.env.GRAFANA_PROM_URL;
const promUser = process.env.GRAFANA_PROM_USER;
const promToken = process.env.GRAFANA_PROM_TOKEN;

if (!promUrl || !promUser || !promToken) {
  console.error('Missing Grafana Cloud environment variables');
  process.exit(1);
}

// --- 1. Extract Metrics ---
if (!fs.existsSync(resultsPath)) {
  console.error(`Results file not found: ${resultsPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const stats = data.stats;
const timestampMs = Date.now();

const metrics = {
  passed: stats.expected || 0,
  failed: stats.unexpected || 0,
  skipped: stats.skipped || 0,
  flaky: stats.flaky || 0,
  duration_ms: Math.round(stats.duration || 0),
  total:
    (stats.expected || 0) +
    (stats.unexpected || 0) +
    (stats.skipped || 0),
};

console.log('Extracted metrics:', metrics);

// --- 2. Build TimeSeries ---
const commonLabels = {
  job: 'playwright-tests',
  instance: 'github-actions',
};

function createTimeSeries(name, value, labels, timestamp) {
  return {
    labels: Object.entries({ __name__: name, ...labels }).map(
      ([name, value]) => ({ name, value })
    ),
    samples: [{ value, timestamp }],
  };
}

const timeSeries = [
  createTimeSeries('test_passed_total', metrics.passed, commonLabels, timestampMs),
  createTimeSeries('test_failed_total', metrics.failed, commonLabels, timestampMs),
  createTimeSeries('test_skipped_total', metrics.skipped, commonLabels, timestampMs),
  createTimeSeries('test_flaky_total', metrics.flaky, commonLabels, timestampMs),
  createTimeSeries('test_duration_ms', metrics.duration_ms, commonLabels, timestampMs),
  createTimeSeries('test_total', metrics.total, commonLabels, timestampMs),
];

// --- 3. Push Metrics ---
async function pushMetrics() {
  try {
    if (!fs.existsSync(protoPath)) {
      throw new Error(`remote.proto not found at ${protoPath}`);
    }

    const root = await protobuf.load(protoPath);
    const WriteRequest = root.lookupType('prometheus.WriteRequest');

    const message = WriteRequest.create({ timeseries: timeSeries });
    const encoded = WriteRequest.encode(message).finish();
    const compressed = await snappy.compress(encoded);

    const parsedUrl = url.parse(promUrl);
    const auth = Buffer.from(`${promUser}:${promToken}`).toString('base64');

    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-protobuf',
        'Content-Encoding': 'snappy',
        'X-Prometheus-Remote-Write-Version': '0.1.0',
        'Content-Length': compressed.length,
      },
    };

    console.log(`Pushing ${timeSeries.length} metrics to Grafana Cloud`);

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            console.log('Metrics pushed successfully');
            resolve();
          } else {
            reject(
              new Error(`HTTP ${res.statusCode}: ${body}`)
            );
          }
        });
      });

      req.on('error', reject);
      req.write(compressed);
      req.end();
    });
  } catch (err) {
    console.error('Push failed:', err.message);
    process.exit(1);
  }
}

pushMetrics();
