require('dotenv').config(); // Automatically loads GRAFANA_USER and GRAFANA_TOKEN
const fs = require('fs');
const https = require('https');

async function sendMetrics() {
    try {
        const rawData = fs.readFileSync('test-results/results.json', 'utf8');
        const data = JSON.parse(rawData);
        const timestampNs = Date.now() * 1000000;
        let metricLines = [];

        function extractTests(suites) {
            suites.forEach(suite => {
                if (suite.specs) {
                    suite.specs.forEach(spec => {
                        spec.tests.forEach(test => {
                            const result = test.results[0];
                            
                            // 1. Sanitize: Replace all non-alphanumeric chars with underscores
                            // This prevents "400 Bad Request" from special characters in titles
                            const cleanName = spec.title.replace(/[^a-zA-Z0-9]/g, '_');
                            const status = result.status;
                            const duration = result.duration || 0;
                            const value = status === 'passed' ? 1 : 0;

                            // 2. Format: Influx Line Protocol
                            // Measurement: playwright_test_report
                            // Tags: test_name, status
                            // Fields: value (1/0), duration (ms)
                            metricLines.push(`playwright_test_report,test_name=${cleanName},status=${status} value=${value},duration=${duration} ${timestampNs}`);
                        });
                    });
                }
                // Handle nested suites
                if (suite.suites) extractTests(suite.suites);
            });
        }

        extractTests(data.suites);
        const body = metricLines.join('\n');

        // 3. Connection Setup
        const url = new URL("https://prometheus-prod-43-prod-ap-south-1.grafana.net/api/v1/push/influx/write");
        const auth = Buffer.from(`${process.env.GRAFANA_USER}:${process.env.GRAFANA_TOKEN}`).toString('base64');

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`, //
                'Content-Type': 'text/plain'
            }
        };

        console.log(`🚀 Pushing ${metricLines.length} test results to Grafana...`);

        const req = https.request(url, options, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            if (res.statusCode !== 204) {
                res.on('data', d => console.log("Response:", d.toString()));
            } else {
                console.log("✅ Success: All test details pushed!");
            }
        });

        req.on('error', (e) => console.error(`❌ Network Error: ${e.message}`));
        req.write(body);
        req.end();

    } catch (error) {
        console.error('❌ Script Error:', error.message);
    }
}

sendMetrics();