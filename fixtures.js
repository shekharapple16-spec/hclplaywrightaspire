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
// ════════════════════════════════════════════════════════════════════

const SKILL_LOCATORS = `
## LOCATOR BEST PRACTICES
Priority order:
1. getByRole()        → page.getByRole('button', { name: 'Submit' })
2. getByLabel()       → page.getByLabel('Email address')
3. getByPlaceholder() → page.getByPlaceholder('Enter email')
4. getByText()        → page.getByText('Welcome', { exact: true })
5. getByTestId()      → page.getByTestId('submit-btn')
6. locator()          → LAST RESORT only

ANTI-PATTERNS TO REPLACE:
- page.locator('.btn-primary')     → page.getByRole('button', { name: 'Submit' })
- page.locator('#dynamic-id-123')  → use role/text/testid instead
- page.$('#id')                    → page.locator('#id') or getByRole
- page.fill('#username123', ...)   → wrong selector, check DOM for real id

COMMON ISSUES:
- "locator not found"   → selector changed in DOM, use getByRole/getByText
- "timeout exceeded"    → element not visible, add toBeVisible() wait
- "strict mode"         → multiple elements match, be more specific
- "not attached to DOM" → stale element, re-query
`.trim();

const SKILL_ASSERTIONS = `
## ASSERTIONS & WAITING BEST PRACTICES
ALWAYS use web-first assertions (auto-retry):
  await expect(locator).toBeVisible()
  await expect(locator).toBeEnabled()
  await expect(locator).toHaveText('...')
  await expect(locator).toContainText('...')
  await expect(page).toHaveURL('/dashboard')

NEVER USE:
  ❌ await page.waitForTimeout(3000)
  ❌ await new Promise(r => setTimeout(r, 1000))

CORRECT WAITING:
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
  await page.waitForURL('/dashboard');
  await page.waitForLoadState('networkidle');
`.trim();

const SKILL_FLAKY = `
## FIXING FAILING TESTS
"locator not found":
  → Selector wrong — check DOM for correct id/selector
  → page.fill('#username123') when real id is #username → fix the selector

"timeout exceeded":
  → add: await expect(locator).toBeVisible({ timeout: 10000 }) before interacting

"element outside viewport":
  → await locator.scrollIntoViewIfNeeded()

"strict mode violation":
  → add .filter({ hasText: '...' }) or .nth(0)
`.trim();

// ════════════════════════════════════════════════════════════════════
//  DOM COMPRESSION PIPELINE
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
//  GROQ — fix generation with skill knowledge
// ════════════════════════════════════════════════════════════════════

async function generateFixWithGroq({ error, stack, testFn, domContext, consoleLogs, testFile, originalError }) {

  const apiKey = process.env.GROQ_API_KEY;
  console.log(`🔑 GROQ KEY: ${apiKey ? 'FOUND (' + apiKey.slice(0,8) + '...)' : 'MISSING'}`);

  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not set — cannot generate fix');
    return null;
  }

  const combinedError = (originalError && originalError !== error)
    ? `First run:\n${originalError}\n\nRe-run:\n${error}`
    : error;

  const prompt = [
    '# Playwright Best Practices',
    SKILL_LOCATORS, '',
    SKILL_ASSERTIONS, '',
    SKILL_FLAKY, '',
    '---',
    '# Fix This Failing Test',
    `ERROR:\n${combinedError?.slice(0, 400) || 'unknown'}`,
    `STACK:\n${stack || ''}`,
    `FAILING TEST:\n\`\`\`js\n${testFn}\n\`\`\``,
    domContext  ? `DOM AT FAILURE:\n${domContext}` : '',
    consoleLogs ? `CONSOLE ERRORS:\n${consoleLogs}` : '',
    '',
    'Return ONLY JSON (no markdown):',
    `{"prTitle":"fix: ...","rootCause":"...","explanation":"...","fix":{"path":"${testFile}","message":"fix: ...","content":"<FULL corrected file>"}}`,
  ].filter(Boolean).join('\n');

  const groq = new Groq({ apiKey });

  const res = await groq.chat.completions.create({
    model:           'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'Expert Playwright engineer. Return ONLY valid JSON, no markdown fences.' },
      { role: 'user',   content: prompt },
    ],
    temperature:     0.05,
    max_tokens:      2500,
    response_format: { type: 'json_object' },
  });

  const usage = res.usage;
  console.log(`🧠 Groq | prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} tokens`);

  const raw = res.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

// ════════════════════════════════════════════════════════════════════
//  NOTIFY SERVER
// ════════════════════════════════════════════════════════════════════

function notifyServer(payload) {
  return new Promise((resolve) => {
    const botUrl    = process.env.BOT_WEBHOOK_URL;
    const botSecret = process.env.BOT_SECRET;

    console.log(`📡 BOT_WEBHOOK_URL: ${botUrl ? botUrl : 'MISSING'}`);
    console.log(`🔐 BOT_SECRET: ${botSecret ? 'FOUND' : 'MISSING'}`);

    if (!botUrl || !botSecret) {
      console.warn('⚠️  BOT_WEBHOOK_URL or BOT_SECRET missing — skipping notify');
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
        console.log(res.statusCode === 200
          ? '✅ Server notified successfully'
          : `❌ Server returned ${res.statusCode}: ${data}`
        );
        resolve();
      });
    });
    req.on('error', e => { console.error('❌ Notify error:', e.message); resolve(); });
    req.setTimeout(20000, () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}

// ════════════════════════════════════════════════════════════════════
//  FIXTURE
// ════════════════════════════════════════════════════════════════════

export const test = base.extend({
  aiDiagnostics: [async ({ page }, use, testInfo) => {

    // Capture DOM via load events — page is alive here, not after use()
    let lastDom = '';
    let lastUrl = '';
    const consoleLogs = [];

    page.on('load', async () => {
      try {
        lastDom = await page.content();
        lastUrl = page.url();
      } catch (_) {}
    });

    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text().slice(0, 200));
    });

    await use(); // run the actual test

    if (!['failed', 'timedOut'].includes(testInfo.status)) return;

    console.log(`\n🔍 AI diagnosing: "${testInfo.title}" (${testInfo.status})`);
    console.log(`   URL at failure: ${lastUrl}`);
    console.log(`   DOM captured:   ${lastDom.length} chars`);

    try {
      const absFile  = testInfo.file;
      const testFile = path.relative(process.cwd(), absFile).replace(/\\/g, '/');
      const source   = fs.existsSync(absFile) ? fs.readFileSync(absFile, 'utf8') : '';

      const selectors  = extractSelectors(source);
      const domContext = compressDom(lastDom, selectors);
      const testFn     = extractTestFunction(source, testInfo.title);

      const error = testInfo.error?.message || 'unknown error';
      const stack = (testInfo.error?.stack || '').split('\n').slice(0, 6).join('\n');

      console.log(`📊 DOM compressed: ${lastDom.length} → ${domContext.length} chars`);
      console.log(`🔎 Selectors: ${selectors.join(', ')}`);
      console.log(`⚠️  Error: ${error.slice(0, 200)}`);

      const result = await generateFixWithGroq({
        error, stack, testFn, domContext,
        consoleLogs: consoleLogs.slice(0, 5).join('\n'),
        testFile,
        originalError: process.env.ORIGINAL_ERROR || '',
      });

      if (!result) return;

      console.log(`\n--- AI FIX ---`);
      console.log(`Root cause:  ${result.rootCause}`);
      console.log(`Explanation: ${result.explanation}`);
      console.log(`--------------\n`);

      await notifyServer({
        type:      'ai_fix_context',
        phone:     process.env.PHONE_NUMBER,
        testTitle: testInfo.title,
        testFile,
        runUrl:    process.env.RUN_URL || '',
        fix:       result,
        domContext,
        error,
      });

    } catch (err) {
      console.error('❌ AI diagnostic error:', err.message);
      if (err.stack) console.error(err.stack.split('\n').slice(0, 4).join('\n'));
    }

  }, { auto: true }],
});
