import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import Groq from 'groq-sdk';

export { expect } from '@playwright/test';

// ════════════════════════════════════════════════════════════════════
//  PLAYWRIGHT BEST PRACTICES KNOWLEDGE
//  Source: github.com/currents-dev/playwright-best-practices-skill
//  Injected into Groq prompt so fixes follow correct patterns.
//  Three most critical references for fixing failures:
//    - core/locators.md
//    - debugging/flaky-tests.md
//    - core/assertions-waiting.md
// ════════════════════════════════════════════════════════════════════

const SKILL_LOCATORS = `
## LOCATOR BEST PRACTICES (core/locators.md)
Priority order — always use highest available:
1. getByRole()        → page.getByRole('button', { name: 'Submit' })
2. getByLabel()       → page.getByLabel('Email address')
3. getByPlaceholder() → page.getByPlaceholder('Enter email')
4. getByText()        → page.getByText('Welcome', { exact: true })
5. getByTestId()      → page.getByTestId('submit-btn')
6. locator()          → LAST RESORT only, prefer semantic selectors

ANTI-PATTERNS TO REPLACE:
- page.locator('.btn-primary')    → page.getByRole('button', { name: 'Submit' })
- page.locator('#dynamic-id-123') → use role/text/testid instead
- page.$('#id')                   → page.locator('#id') or getByRole
- page.$$('.items')               → page.getByRole('listitem').all()

FILTERING:
- page.getByRole('listitem').filter({ hasText: 'Product' })
- page.getByRole('listitem').first() / .last() / .nth(2)
- page.getByRole('article').getByRole('heading')  ← chaining

COMMON ISSUES:
- Multiple elements match → add .filter() or .nth() or be more specific
- Element not found      → selector changed, use getByRole/getByText instead
- Stale element          → locators are lazy, re-query if DOM changes
- Dynamic IDs            → use stable attributes: role, text, data-testid
`.trim();

const SKILL_ASSERTIONS = `
## ASSERTIONS & WAITING BEST PRACTICES (core/assertions-waiting.md)
ALWAYS use web-first assertions — they auto-retry until condition met:
  await expect(locator).toBeVisible()
  await expect(locator).toBeEnabled()
  await expect(locator).toHaveText('...')
  await expect(locator).toContainText('...')
  await expect(locator).toHaveValue('...')
  await expect(locator).toHaveCount(5)
  await expect(page).toHaveURL('/dashboard')
  await expect(page).toHaveTitle('...')

NEVER USE — causes flakiness:
  ❌ await page.waitForTimeout(3000)      → use expect assertions instead
  ❌ await new Promise(r => setTimeout(r, 1000))
  ❌ generic expect(value).toBe() on DOM  → use web-first expect(locator)

CORRECT WAITING PATTERNS:
  // Wait for element to appear
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  // Wait for element to disappear
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
  // Wait for navigation
  await page.waitForURL('/dashboard');
  // Wait for network response then assert
  const res = page.waitForResponse('**/api/data');
  await page.click('#load');
  await res;
  await expect(page.locator('.data-row')).toHaveCount(10);
  // Wait for load state
  await page.waitForLoadState('networkidle');
`.trim();

const SKILL_FLAKY = `
## FIXING FLAKY/FAILING TESTS (debugging/flaky-tests.md)
COMMON FAILURE PATTERNS AND FIXES:

"locator not found" / "element not found":
  → Selector changed in DOM — replace CSS with getByRole/getByText
  → Element not yet in DOM  — add waitFor({ state: 'visible' })
  → Wrong iframe context    — use page.frameLocator('iframe').getByRole(...)

"timeout exceeded" / "waiting for locator":
  → Element exists but not visible/enabled
  → Fix: await expect(locator).toBeVisible({ timeout: 10000 }) before interacting
  → Never add waitForTimeout — find the real condition to wait for

"strict mode violation" (multiple elements):
  → Selector matches more than one element
  → Fix: add .filter({ hasText: '...' }) or .nth(0) or be more specific

"element is not attached to DOM":
  → Stale reference after DOM update
  → Fix: re-query the locator, don't store locator references across awaits

"element is outside viewport":
  → Fix: await locator.scrollIntoViewIfNeeded() before click

"element intercepts pointer events":
  → Another element is on top
  → Fix: wait for overlay to disappear first, or use force: true as last resort

ASYNC/TIMING FIXES:
  // Bad — arbitrary sleep
  await page.waitForTimeout(2000);
  // Good — wait for specific condition
  await expect(page.locator('.results')).toBeVisible();
  await expect(page.locator('.results')).toHaveCount(5);
`.trim();

// ════════════════════════════════════════════════════════════════════
//  DOM COMPRESSION PIPELINE
//  raw HTML (500KB+) → structural summary (~200 tokens)
// ════════════════════════════════════════════════════════════════════

function extractSelectors(testSource) {
  const patterns = [
    /(?:locator|fill|click|type|waitForSelector|getByRole|getByText|getByLabel|getByPlaceholder|getByTestId)\s*\(\s*['"`]([^'"`\n]{2,80})['"`]/g,
    /(#[\w-]{2,}|\.(?!\d)[\w-]{2,}|\[[\w-]+=['"]?[\w-]+['"]?\])/g,
  ];
  const selectors = new Set();
  for (const re of patterns) {
    for (const m of testSource.matchAll(re)) {
      if (m[1] && m[1].length > 1) selectors.add(m[1].trim());
    }
  }
  return [...selectors].slice(0, 15);
}

function filterRelevantElements(bodyHtml, selectors) {
  if (!selectors.length) return bodyHtml.slice(0, 1500);
  const tags = bodyHtml.match(/<[^>]+>[^<]*/g) || [];
  const relevant = tags.filter(tag => {
    const t = tag.toLowerCase();
    return selectors.some(s => {
      const clean = s.replace(/^[#.\[]/, '').toLowerCase().replace(/["'\]]/g, '');
      return clean.length > 1 && t.includes(clean);
    });
  });
  if (!relevant.length) {
    return tags
      .filter(t => /<(input|button|a |select|textarea|form|label)/i.test(t))
      .slice(0, 20).join('\n').slice(0, 1500);
  }
  return relevant.slice(0, 25).join('\n').slice(0, 2000);
}

function stripNoise(html) {
  return html
    .replace(/\s+class="[^"]{40,}"/g, '')
    .replace(/\s+style="[^"]*"/g, '')
    .replace(/\s+data-(?!testid)[\w-]+="[^"]*"/g, '')
    .replace(/\s+aria-(?!label|role)[\w-]+="[^"]*"/g, '')
    .replace(/\s+on\w+="[^"]*"/g, '')
    .replace(/\s+/g, ' ').trim();
}

function toStructuralSummary(html) {
  const lines = [];
  const tagRe = /<(\w+)([^>]*)>([^<]*)/g;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const [, tag, attrs, text] = m;
    const id        = (attrs.match(/id="([^"]+)"/) || [])[1];
    const type      = (attrs.match(/type="([^"]+)"/) || [])[1];
    const name      = (attrs.match(/name="([^"]+)"/) || [])[1];
    const ph        = (attrs.match(/placeholder="([^"]+)"/) || [])[1];
    const testid    = (attrs.match(/data-testid="([^"]+)"/) || [])[1];
    const ariaLabel = (attrs.match(/aria-label="([^"]+)"/) || [])[1];
    const role      = (attrs.match(/role="([^"]+)"/) || [])[1];
    const href      = (attrs.match(/href="([^"]+)"/) || [])[1];
    const content   = text.trim().slice(0, 40);

    let line = tag;
    if (id)        line += `#${id}`;
    if (type)      line += `[type=${type}]`;
    if (name)      line += `[name=${name}]`;
    if (ph)        line += `[placeholder="${ph}"]`;
    if (testid)    line += `[data-testid="${testid}"]`;
    if (ariaLabel) line += `[aria-label="${ariaLabel}"]`;
    if (role)      line += `[role=${role}]`;
    if (href)      line += `[href="${href.slice(0, 50)}"]`;
    if (content)   line += ` "${content}"`;

    if (line !== tag) lines.push(line);
  }
  return [...new Set(lines)].slice(0, 30).join('\n');
}

function compressDom(rawHtml, selectors) {
  if (!rawHtml) return '';
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : rawHtml;
  body = body.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const filtered   = filterRelevantElements(body, selectors);
  const stripped   = stripNoise(filtered);
  const structural = toStructuralSummary(stripped);
  return structural || stripped.slice(0, 800);
}

function extractTestFunction(source, title) {
  if (!source || !title) return source?.slice(0, 800) || '';
  const safe  = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re    = new RegExp(`(?:test|it)\\s*\\(['"\`]${safe}['"\`]\\s*,[\\s\\S]*?\\n\\s*\\}`, 'i');
  const match = source.match(re);
  return match ? match[0].slice(0, 800) : source.slice(0, 800);
}

// ════════════════════════════════════════════════════════════════════
//  GROQ — fix generation with real skill knowledge injected
// ════════════════════════════════════════════════════════════════════

async function generateFixWithGroq({ error, stack, testFn, domContext, consoleLogs, testFile, originalError }) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Combine original error (from first run) + live error (from re-run)
  const combinedError = (originalError && originalError !== error)
    ? `First run error:\n${originalError}\n\nRe-run error:\n${error}`
    : error;

  // Build prompt — skill knowledge first, then context, then task
  const prompt = [
    '# Playwright Best Practices',
    SKILL_LOCATORS,
    '',
    SKILL_ASSERTIONS,
    '',
    SKILL_FLAKY,
    '',
    '---',
    '',
    '# Your Task: Fix This Failing Test',
    'Apply the best practices above. Replace brittle selectors. Remove waitForTimeout. Use web-first assertions.',
    '',
    `ERROR:\n${combinedError?.slice(0, 400) || 'unknown'}`,
    '',
    `STACK (top 5 lines):\n${stack || ''}`,
    '',
    `FAILING TEST:\n\`\`\`js\n${testFn}\n\`\`\``,
    domContext ? `\nDOM AT FAILURE (what is actually on the page):\n${domContext}` : '',
    consoleLogs ? `\nCONSOLE ERRORS:\n${consoleLogs}` : '',
    '',
    'Return ONLY a JSON object — no markdown fences, no explanation outside JSON:',
    `{"prTitle":"fix: ...","rootCause":"...","explanation":"...","fix":{"path":"${testFile}","message":"fix: ...","content":"<FULL corrected file content here>"}}`,
  ].filter(Boolean).join('\n');

  const res = await groq.chat.completions.create({
    model:           'mixtral-8x7b-32768',  // reliable JSON mode on Groq
    messages: [
      { role: 'system', content: 'You are an expert Playwright engineer. You follow best practices strictly. Return ONLY valid JSON with no markdown fences and no text outside the JSON object.' },
      { role: 'user',   content: prompt },
    ],
    temperature:     0.05,
    max_tokens:      2500,
    response_format: { type: 'json_object' },
  });

  const usage = res.usage;
  console.log(`🧠 Groq | prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens} tokens`);

  // Safe parse — strip any accidental fences
  const raw = res.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

// ════════════════════════════════════════════════════════════════════
//  NOTIFY SERVER — POST to /ai-fix-callback
// ════════════════════════════════════════════════════════════════════

function notifyServer(payload) {
  return new Promise((resolve) => {
    const botUrl    = process.env.BOT_WEBHOOK_URL;
    const botSecret = process.env.BOT_SECRET;
    if (!botUrl || !botSecret) {
      console.warn('⚠️  BOT_WEBHOOK_URL or BOT_SECRET not set — skipping');
      return resolve();
    }

    const body     = JSON.stringify({ ...payload, secret: botSecret });
    const endpoint = new URL('/ai-fix-callback', botUrl);
    const isHttps  = endpoint.protocol === 'https:';
    const options  = {
      hostname: endpoint.hostname,
      port:     endpoint.port || (isHttps ? 443 : 80),
      path:     endpoint.pathname,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-bot-secret':   botSecret,
      },
    };

    const req = (isHttps ? https : http).request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log(res.statusCode === 200 ? '✅ Server notified' : `❌ Server ${res.statusCode}: ${data}`);
        resolve();
      });
    });
    req.on('error', e => { console.error('❌ Notify:', e.message); resolve(); });
    req.setTimeout(20000, () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}

// ════════════════════════════════════════════════════════════════════
//  FIXTURE — aiDiagnostics (auto, runs on every test)
// ════════════════════════════════════════════════════════════════════

export const test = base.extend({
  aiDiagnostics: [async ({ page }, use, testInfo) => {

    // ── KEY FIX: capture DOM during test via page events ──────────
    // page.content() AFTER use() fails because page is already closed.
    // We capture on every 'load' event — most recent = state at failure.
    let lastDom = '';
    let lastUrl = '';
    const consoleLogs = [];

    page.on('load', async () => {
      try {
        lastDom = await page.content();
        lastUrl = page.url();
      } catch (_) { /* page may close between event and capture */ }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text().slice(0, 200));
    });

    // ── Run the actual test ───────────────────────────────────────
    await use();

    // ── Only trigger on failure ───────────────────────────────────
    if (testInfo.status !== 'failed' && testInfo.status !== 'timedOut') return;

    console.log(`\n🔍 AI diagnosing: "${testInfo.title}" (${testInfo.status})`);
    console.log(`   URL at failure: ${lastUrl}`);
    console.log(`   DOM captured:   ${lastDom.length} chars`);

    try {
      // Resolve test file path
      const absFile  = testInfo.file;
      const testFile = path.relative(process.cwd(), absFile).replace(/\\/g, '/');
      const testSource = fs.existsSync(absFile)
        ? fs.readFileSync(absFile, 'utf8') : '';

      // DOM compression pipeline
      const selectors  = extractSelectors(testSource);
      const domContext = compressDom(lastDom, selectors);
      const testFn     = extractTestFunction(testSource, testInfo.title);

      const error = testInfo.error?.message || 'unknown error';
      const stack = (testInfo.error?.stack || '').split('\n').slice(0, 6).join('\n');

      // originalError comes from first run (passed via env by ai-fix.yml)
      const originalError = process.env.ORIGINAL_ERROR || '';

      console.log(`📊 DOM: ${lastDom.length} → ${domContext.length} chars`);
      console.log(`🔎 Selectors: ${selectors.join(', ')}`);
      console.log(`⚠️  Error: ${error.slice(0, 150)}`);

      // Call Groq with skill knowledge + compressed context
      const result = await generateFixWithGroq({
        error, stack, testFn, domContext,
        consoleLogs: consoleLogs.slice(0, 5).join('\n'),
        testFile,
        originalError,
      });

      console.log(`\n--- AI FIX ---`);
      console.log(`Root cause:  ${result.rootCause}`);
      console.log(`Explanation: ${result.explanation}`);
      console.log(`PR title:    ${result.prTitle}`);
      console.log(`--------------\n`);

      // Notify server — server does branch + commit + PR (pure git ops)
      await notifyServer({
        type:          'ai_fix_context',
        phone:         process.env.PHONE_NUMBER,
        testTitle:     testInfo.title,
        testFile,
        runUrl:        process.env.RUN_URL || '',
        fix:           result,
        domContext,
        error,
      });

    } catch (err) {
      console.error('❌ AI diagnostic error:', err.message);
      if (err.stack) console.error(err.stack.split('\n').slice(0, 4).join('\n'));
    }

  }, { auto: true }],
});
