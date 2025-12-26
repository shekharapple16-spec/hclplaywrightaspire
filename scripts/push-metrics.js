const fs = require('fs');
// Third attempt at correct import: Import the whole module and access the constructor as a property.
const RemoteWriteModule = require('prometheus-remote-write');
const RemoteWriteClient = RemoteWriteModule.RemoteWriteClient;

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

const series = [
  {
    name: 'test_results_passed_total',
    labels: { ...commonLabels, result: 'passed' },
    value: metrics.passed,
    timestamp: timestampMs,
  },
  {
    name: 'test_results_failed_total',
    labels: { ...commonLabels, result: 'failed' },
    value: metrics.failed,
    timestamp: timestampMs,
  },
  {
    name: 'test_results_skipped_total',
    labels: { ...commonLabels, result: 'skipped' },
    value: metrics.skipped,
    timestamp: timestampMs,
  },
  {
    name: 'test_results_flaky_total',
    labels: { ...commonLabels, result: 'flaky' },
    value: metrics.flaky,
    timestamp: timestampMs,
  },
  {
    name: 'test_duration_milliseconds',
    labels: commonLabels,
    value: metrics.duration_ms,
    timestamp: timestampMs,
  },
  {
    name: 'test_results_total',
    labels: commonLabels,
    value: metrics.total,
    timestamp: timestampMs,
  },
];

// --- 3. Send Metrics to Prometheus ---

async function pushMetrics() {
  try {
    // Instantiate the client using the correctly accessed constructor
    const client = new RemoteWriteClient({
      url: promUrl,
      username: promUser,
      password: promToken,
      // The library handles Protobuf encoding and Snappy compression automatically
    });

    console.log(`Attempting to push ${series.length} time series to ${promUrl}`);

    // The client expects an array of TimeSeries objects.
    await client.push(series);

    console.log('Successfully pushed metrics to Grafana Cloud.');
  } catch (error) {
    console.error('Failed to push metrics to Grafana Cloud:', error.message);
    // Log the full error for debugging, but be careful not to expose sensitive info
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response Body:', await error.response.text());
    }
    process.exit(1);
  }
}

pushMetrics();
