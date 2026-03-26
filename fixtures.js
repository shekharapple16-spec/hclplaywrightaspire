import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import Groq from 'groq-sdk';

export { expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────
//  DOM COMPRESSION PIPELINE
//  Goal: raw HTML (500KB+) → structural summary (~200 tokens)
// ─────────────────────────────────────────────────────────────────

// Stage 1 — extract selectors the test actually uses
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

// Stage 2 — keep only elements relevant to those selectors
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
  // if nothing matched, fall back to all interactive elements
  if (!relevant.length) {
    return tags
      .filter(t => /<(input|button|a |select|textarea|form|label)/i.test(t))
      .slice(0, 20)
      .join('\n')
      .slice(0, 1500);
  }
  return relevant.slice(0, 25).join('\n').slice(0, 2000);
}

// Stage 3 — strip noise attributes, keep only signal
function stripNoise(html) {
  return html
    .replace(/\s+class="[^"]{40,}"/g, '')           // long class strings
    .replace(/\s+style="[^"]*"/g, '')               // inline styles
    .replace(/\s+data-(?!testid)[\w-]+="[^"]*"/g, '') // data-* except testid
    .replace(/\s+aria-(?!label|role)[\w-]+="[^"]*"/g, '') // aria-* except label/role
    .replace(/\s+on\w+="[^"]*"/g, '')              // event handlers
    .replace(/\s+/g, ' ')                           // collapse whitespace
    .trim();
}

// Stage 4 — convert to structural summary (1 line per element)
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
    const href      = (attrs.match(/href="([^"]+)"/) || [])[1];
    const content   = text.trim().slice(0, 40);

    let line = tag;
    if (id)        line += `#${id}`;
    if (type)      line += `[type=${type}]`;
    if (name)      line += `[name=${name}]`;
    if (ph)        line += `[placeholder="${ph}"]`;
    if (testid)    line += `[data-testid="${testid}"]`;
    if (ariaLabel) line += `[aria-label="${ariaLabel}"]`;
    if (href)      line += `[href="${href.slice(0, 50)}"]`;
    if (content)   line += ` "${content}"`;

    if (line !== tag) lines.push(line); // only lines with useful attrs
  }
  return [...new Set(lines)].slice(0, 30).join('\n'); // dedupe, max 30 lines
}

// Full pipeline — raw DOM in, ~200-token structural summary out
function compressDom(rawHtml, selectors) {
  if (!rawHtml) return '';
  // extract body
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : rawHtml;
  // remove scripts + styles entirely
  body = body.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const filtered   = filterRelevantElements(body, selectors);
  const stripped   = stripNoise(filtered);
  const structural = toStructuralSummary(stripped);
  return structural || stripped.slice(0, 800);
}

// Extract just the failing test function from source
function extractTestFunction(source, title) {
  if (!source || !title) return source?.slice(0, 800) || '';
  const safe  = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re    = new RegExp(`(?:test|it)\\s*\\(['"]${safe}['"]\\s*,[\\s\\S]*?\\n\\s*\\}`, 'i');
  const match = source.match(re);
  return match ? match[0].slice(0, 800) : source.slice(0, 800);
}

// ─────────────────────────────────────────────────────────────────
//  GROQ — surgical fix generation (fixture side)
//  Input: ~400-600 tokens   Output: fix JSON
// ─────────────────────────────────────────────────────────────────

async function generateFixWithGroq({ error, stack, testFn, domContext, consoleLogs, testFile }) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt =
    `Fix this failing Playwright test.\n\n` +
    `ERROR:\n${error?.slice(0, 300) || 'unknown'}\n\n` +
    `STACK (top 5 lines):\n${stack || ''}\n\n` +
    `FAILING TEST:\n\`\`\`js\n${testFn}\n\`\`\`\n\n` +
    (domContext ? `DOM AT FAILURE (structural):\n${domContext}\n\n` : '') +
    (consoleLogs ? `CONSOLE ERRORS:\n${consoleLogs}\n\n` : '') +
    `Return ONLY JSON (no markdown):\n` +
    `{"prTitle":"fix: ...","explanation":"...","rootCause":"...",` +
    `"fix":{"path":"${testFile}","message":"fix: ...","content":"<full corrected file content>"}}`;

  const res = await groq.chat.completions.create({
    model:           'llama-3.3-70b-versatile',
    messages:        [
      { role: 'system', content: 'Expert Playwright engineer. Return ONLY valid JSON, no markdown fences.' },
      { role: 'user',   content: prompt },
    ],
    temperature:     0.05,
    max_tokens:      2000,
    response_format: { type: 'json_object' },
  });

  const usage = res.usage;
  console.log(`🧠 Groq fix | prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens} tokens`);

  return JSON.parse(res.choices[0].message.content);
}

// ─────────────────────────────────────────────────────────────────
//  NOTIFY SERVER — POST fix context to /ai-fix-callback
// ─────────────────────────────────────────────────────────────────

function notifyServer(payload) {
  return new Promise((resolve, reject) => {
    const botUrl    = process.env.BOT_WEBHOOK_URL;
    const botSecret = process.env.BOT_SECRET;
    if (!botUrl || !botSecret) {
      console.warn('⚠️  BOT_WEBHOOK_URL or BOT_SECRET not set — skipping server notify');
      return resolve();
    }

    const body    = JSON.stringify({ ...payload, secret: botSecret });
    const endpoint = new URL('/ai-fix-callback', botUrl);
    const isHttps  = endpoint.protocol === 'https:';
    const options  = {
      hostname: endpoint.hostname,
      port:     endpoint.port || (isHttps ? 443 : 80),
      path:     endpoint.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-bot-secret':   botSecret,
      },
    };

    const req = (isHttps ? https : http).request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server notified');
          resolve();
        } else {
          console.error(`❌ Server returned ${res.statusCode}: ${data}`);
          resolve(); // don't fail test run over notify error
        }
      });
    });
    req.on('error', e => { console.error('❌ Notify error:', e.message); resolve(); });
    req.setTimeout(15000, () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────
//  FIXTURE
// ─────────────────────────────────────────────────────────────────

export const test = base.extend({
  aiDiagnostics: [async ({ page }, use, testInfo) => {

    // Capture console errors during the test
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text().slice(0, 200));
    });

    // ── Run the actual test ──────────────────────────────────────
    await use();

    // ── Only trigger on failure ──────────────────────────────────
    if (testInfo.status !== 'failed' && testInfo.status !== 'timedOut') return;

    console.log(`\n🔍 AI diagnosing failure: "${testInfo.title}"`);

    try {
      // 1. Capture exact DOM at failure moment
      const rawDom = await page.content().catch(() => '');

      // 2. Read test source
      const testFile   = path.relative(process.cwd(), testInfo.file);
      const testSource = fs.existsSync(testInfo.file)
        ? fs.readFileSync(testInfo.file, 'utf8') : '';

      // 3. Run DOM compression pipeline
      const selectors  = extractSelectors(testSource);
      const domContext = compressDom(rawDom, selectors);

      // 4. Extract just the failing test function
      const testFn = extractTestFunction(testSource, testInfo.title);

      // 5. Build error context
      const error = testInfo.error?.message || 'unknown error';
      const stack = (testInfo.error?.stack || '')
        .split('\n')
        .slice(0, 6)
        .join('\n');

      console.log(`📊 DOM compressed: ${rawDom.length} → ${domContext.length} chars`);
      console.log(`🔍 Selectors found: ${selectors.join(', ')}`);

      // 6. Call Groq — surgical fix (~400-600 tokens in, ~300 out)
      const result = await generateFixWithGroq({
        error,
        stack,
        testFn,
        domContext,
        consoleLogs: consoleLogs.slice(0, 5).join('\n'),
        testFile,
      });

      console.log(`\n--- AI FIX SUGGESTION ---`);
      console.log(`Root cause: ${result.rootCause}`);
      console.log(`Fix: ${result.explanation}`);
      console.log(`-------------------------\n`);

      // 7. Notify server — server does git ops (branch + commit + PR)
      await notifyServer({
        type:        'ai_fix_context',
        phone:       process.env.PHONE_NUMBER,
        testTitle:   testInfo.title,
        testFile,
        runUrl:      process.env.RUN_URL || '',
        fix:         result,           // already generated — server just commits it
        domContext,
        error,
      });

    } catch (err) {
      console.error('❌ AI diagnostic error:', err.message);
    }

  }, { auto: true }],
});
