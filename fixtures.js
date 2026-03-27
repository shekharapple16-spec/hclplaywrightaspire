import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import Groq from 'groq-sdk';

export { expect } from '@playwright/test';

/* =========================
   SKILL KNOWLEDGE
========================= */

const SKILL_LOCATORS = `Use getByRole, getByText, getByLabel. Avoid CSS selectors.`;
const SKILL_ASSERTIONS = `Use expect(locator).toBeVisible() etc. Avoid waitForTimeout.`;
const SKILL_FLAKY = `Fix timeouts using proper waits and visibility checks.`;

/* =========================
   DOM HELPERS (FULL)
========================= */

function extractSelectors(testSource = '') {
  const matches = testSource.match(/['"`](#?\.?\w[\w-]*)['"`]/g) || [];
  return [...new Set(matches.map(s => s.replace(/['"`]/g, '')))].slice(0, 10);
}

function compressDom(html = '', selectors = []) {
  if (!html) return '';
  return html.slice(0, 500); // simplified safe version
}

function extractTestFunction(source = '', title = '') {
  return source.slice(0, 500);
}

/* =========================
   GROQ FIX ENGINE (SAFE)
========================= */

async function generateFixWithGroq({ error, stack, testFn, domContext, consoleLogs, testFile, originalError }) {

  const apiKey = process.env.GROQ_API_KEY;

  console.log('🔑 GROQ KEY:', apiKey ? 'FOUND' : 'MISSING');

  if (!apiKey) {
    console.warn('⚠️ GROQ_API_KEY missing — skipping AI diagnostics');

    return {
      prTitle: 'skip: groq key missing',
      rootCause: 'Missing GROQ_API_KEY',
      explanation: 'Env not available in worker',
      fix: null
    };
  }

  const groq = new Groq({ apiKey });

  const prompt = `
ERROR: ${error}
STACK: ${stack}
TEST: ${testFn}
DOM: ${domContext}
LOGS: ${consoleLogs}
`;

  const res = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'Return JSON only' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(res.choices[0].message.content);
}

/* =========================
   SERVER NOTIFIER
========================= */

function notifyServer(payload) {
  return new Promise(resolve => {
    const botUrl = process.env.BOT_WEBHOOK_URL;
    const botSecret = process.env.BOT_SECRET;

    if (!botUrl || !botSecret) return resolve();

    const data = JSON.stringify({ ...payload, secret: botSecret });
    const url = new URL('/ai-fix-callback', botUrl);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => resolve());

    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

/* =========================
   FIXTURE
========================= */

export const test = base.extend({
  aiDiagnostics: [async ({ page }, use, testInfo) => {

    let lastDom = '';
    let lastUrl = '';
    const logs = [];

    page.on('load', async () => {
      try {
        lastDom = await page.content();
        lastUrl = page.url();
      } catch {}
    });

    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text());
    });

    await use();

    if (!['failed', 'timedOut'].includes(testInfo.status)) return;

    console.log(`🔍 AI diagnosing: ${testInfo.title}`);

    try {
      const source = fs.readFileSync(testInfo.file, 'utf8');

      const selectors = extractSelectors(source);
      const dom = compressDom(lastDom, selectors);
      const testFn = extractTestFunction(source, testInfo.title);

      const result = await generateFixWithGroq({
        error: testInfo.error?.message || '',
        stack: testInfo.error?.stack || '',
        testFn,
        domContext: dom,
        consoleLogs: logs.join('\n'),
        testFile: testInfo.file,
        originalError: process.env.ORIGINAL_ERROR || ''
      });

      if (!result) {
        console.warn('⚠️ No AI result');
        return;
      }

      console.log('Root cause:', result.rootCause);

      await notifyServer({
        type: 'ai_fix_context',
        fix: result
      });

    } catch (err) {
      console.error('❌ AI diagnostic error:', err.message);
    }

  }, { auto: true }]
});
