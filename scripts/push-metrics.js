const fs = require('fs');
const https = require('https');
const url = require('url');
const protobuf = require('protobufjs');
const snappy = require('snappy');

// --- Configuration ---
const resultsPath = 'test-results/results.json';
const promUrl = process.env.GRAFANA_PROM_URL;
const promUser = process.env.GRAFANA_PROM_USER;
const promToken = process.env.GRAFANA_PROM_TOKEN;

if (!promUrl || !promUser || !promToken) {
  console.error('Error: Missing one or more required environment variables (GRAFANA_PROM_URL, GRAFANA_PROM_USER, GRAFANA_PROM_TOKEN).');
  process.exit(1);
}

// --- 1. Extract Metrics ---
if (!fs.existsSync(resultsPath)) {
  console.error(`Error: Results file not found at ${resultsPath}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
} catch (e) {
  console.error('Error parsing results.json:', e.message);
  process.exit(1);
}

const stats = data.stats;
// Prometheus expects timestamps in milliseconds
const timestampMs = Date.now();

const metrics = {
  passed: stats.expected || 0,
  failed: stats.unexpected || 0,
  skipped: stats.skipped || 0,
  flaky: stats.flaky || 0,
  duration_ms: Math.round(stats.duration || 0),
  total: (stats.expected || 0) + (stats.unexpected || 0) + (stats.skipped || 0)
};

console.log('Extracted metrics:', metrics);

// --- 2. Format Metrics for Prometheus Remote Write ---

// Define a common set of labels for all metrics
const commonLabels = {
  job: 'playwright-test-metrics',
  instance: 'github-actions',
  // Add a label to identify the specific run, e.g., from an environment variable
  // run_id: process.env.GITHUB_RUN_ID || 'local'
};

// Helper function to create a TimeSeries object
function createTimeSeries(name, value, labels, timestamp) {
  const allLabels = {
    __name__: name,
    ...labels
  };

  return {
    labels: Object.entries(allLabels).map(([name, value]) => ({ name, value })),
    samples: [{
      value: value,
      timestamp: timestamp,
    }],
  };
}

const timeSeries = [
  createTimeSeries('test_results_passed_total', metrics.passed, { ...commonLabels, result: 'passed' }, timestampMs),
  createTimeSeries('test_results_failed_total', metrics.failed, { ...commonLabels, result: 'failed' }, timestampMs),
  createTimeSeries('test_results_skipped_total', metrics.skipped, { ...commonLabels, result: 'skipped' }, timestampMs),
  createTimeSeries('test_results_flaky_total', metrics.flaky, { ...commonLabels, result: 'flaky' }, timestampMs),
  createTimeSeries('test_duration_milliseconds', metrics.duration_ms, commonLabels, timestampMs),
  createTimeSeries('test_results_total', metrics.total, commonLabels, timestampMs),
];

// --- 3. Send Metrics to Prometheus ---

async function pushMetrics() {
  try {
    // 3a. Load Prometheus Remote Write Protobuf definition
    let remoteProtoPath = '';
    const possiblePaths = [
        'node_modules/prometheus-remote-write/proto/remote.proto', // Most common path
        'node_modules/prometheus-remote-write/node_modules/prometheus-remote-write/proto/remote.proto', // Nested path
    ];

    for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
            remoteProtoPath = path;
            break;
        }
    }

    if (!remoteProtoPath) {
        console.error("Could not find 'remote.proto' file in expected locations.");
        console.error("Please ensure 'prometheus-remote-write' is installed via npm.");
        process.exit(1);
    }

    const remoteRoot = await protobuf.load(remoteProtoPath);
    const WriteRequestType = remoteRoot.lookupType('prometheus.WriteRequest');

    // 3b. Encode the WriteRequest
    const message = WriteRequestType.create({ timeseries: timeSeries });
    const payload = WriteRequestType.encode(message).finish();

    // 3c. Compress the payload with Snappy
    const compressedPayload = await snappy.compress(payload);

    // 3d. Prepare the HTTP request
    const parsedUrl = url.parse(promUrl);
    const auth = Buffer.from(`${promUser}:${promToken}`).toString('base64');

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-protobuf',
        'Content-Encoding': 'snappy',
        'Content-Length': compressedPayload.length,
        'X-Prometheus-Remote-Write-Version': '0.1.0',
      },
    };

    console.log(`Attempting to push ${timeSeries.length} time series to ${promUrl}`);

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            console.log('Successfully pushed metrics to Grafana Cloud.');
            resolve();
          } else {
            console.error(`Failed to push metrics. HTTP Status: ${res.statusCode}`);
            console.error('Response Body:', responseBody);
            reject(new Error(`HTTP Error ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (e) => {
        console.error('Network error during push:', e.message);
        reject(e);
      });

      req.write(compressedPayload);
      req.end();
    });

  } catch (error) {
    console.error('Failed to push metrics to Grafana Cloud:', error.message);
    process.exit(1);
  }
}

pushMetrics();
