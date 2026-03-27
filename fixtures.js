import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import Groq from 'groq-sdk';

export { expect } from '@playwright/test';

// (unchanged skills + DOM functions above...)

async function generateFixWithGroq({ error, stack, testFn, domContext, consoleLogs, testFile, originalError }) {

  // ✅ SAFE GROQ INIT (FIX)
  const apiKey = process.env.GROQ_API_KEY;

  console.log('🔑 GROQ KEY:', apiKey ? 'FOUND' : 'MISSING');

  if (!apiKey) {
    console.warn('⚠️ GROQ_API_KEY missing — skipping AI diagnostics');

    return {
      prTitle: 'skip: groq key missing',
      rootCause: 'GROQ_API_KEY not available in Playwright worker',
      explanation: 'Environment variable not propagated to worker process',
      fix: null
    };
  }

  const groq = new Groq({ apiKey });

  // Combine original error (from first run) + live error (from re-run)
  const combinedError = (originalError && originalError !== error)
    ? `First run error:\n${originalError}\n\nRe-run error:\n${error}`
    : error;

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
    'Apply best practices. Replace brittle selectors. Use web-first assertions.',
    '',
    `ERROR:\n${combinedError?.slice(0, 400) || 'unknown'}`,
    '',
    `STACK:\n${stack || ''}`,
    '',
    `FAILING TEST:\n${testFn}`,
    domContext ? `\nDOM:\n${domContext}` : '',
    consoleLogs ? `\nCONSOLE:\n${consoleLogs}` : '',
    '',
    'Return ONLY JSON:',
    `{"prTitle":"...","rootCause":"...","explanation":"...","fix":{"path":"${testFile}","content":"..."}}`,
  ].filter(Boolean).join('\n');

  const res = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'Return ONLY valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.05,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const raw = res.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

// (notifyServer unchanged)

export const test = base.extend({
  aiDiagnostics: [async ({ page }, use, testInfo) => {

    let lastDom = '';
    let lastUrl = '';
    const consoleLogs = [];

    page.on('load', async () => {
      try {
        lastDom = await page.content();
        lastUrl = page.url();
      } catch {}
    });

    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text().slice(0, 200));
    });

    await use();

    if (testInfo.status !== 'failed' && testInfo.status !== 'timedOut') return;

    console.log(`🔍 AI diagnosing: ${testInfo.title}`);

    try {
      const absFile  = testInfo.file;
      const testFile = path.relative(process.cwd(), absFile).replace(/\\/g, '/');
      const testSource = fs.existsSync(absFile)
        ? fs.readFileSync(absFile, 'utf8') : '';

      const selectors  = extractSelectors(testSource);
      const domContext = compressDom(lastDom, selectors);
      const testFn     = extractTestFunction(testSource, testInfo.title);

      const error = testInfo.error?.message || '';
      const stack = (testInfo.error?.stack || '').split('\n').slice(0, 5).join('\n');

      const result = await generateFixWithGroq({
        error,
        stack,
        testFn,
        domContext,
        consoleLogs: consoleLogs.join('\n'),
        testFile,
        originalError: process.env.ORIGINAL_ERROR || ''
      });

      // ✅ SAFE LOGGING (FIX)
      if (!result) {
        console.warn('⚠️ No AI result returned');
        return;
      }

      console.log(`Root cause: ${result.rootCause}`);
      console.log(`PR title: ${result.prTitle}`);

      await notifyServer({
        type: 'ai_fix_context',
        phone: process.env.PHONE_NUMBER,
        testTitle: testInfo.title,
        testFile,
        runUrl: process.env.RUN_URL || '',
        fix: result,
        domContext,
        error,
      });

    } catch (err) {
      console.error('❌ AI diagnostic error:', err.message);
    }

  }, { auto: true }],
});
