import { test as base, expect } from '@playwright/test';
import { CopilotClient } from "@github/copilot-sdk";

export const test = base.extend({
  // Auto-run fixture for diagnostics
  aiDiagnostics: [async ({}, use, testInfo) => {
    // Run the actual test first
    await use();

    // Trigger only on failure
    if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
      console.log(`\n🔍 AI analyzing failure in: ${testInfo.title}`);
      
      const client = new CopilotClient();
      await client.start();

      try {
        const session = await client.createSession();
        
        const prompt = `
          The Playwright test "${testInfo.title}" failed.
          Error Message: ${testInfo.error?.message}
          
          Context: This is a Playwright framework.
          Task: 
          1. Diagnose the root cause (e.g., Database timeout, API schema change, or UI locator).
          2. Provide a specific code fix for this error.
        `;

        const response = await session.sendAndWait({ prompt });
        console.log("\n--- COPILOT DIAGNOSTIC REPORT ---");
        console.log(response?.data?.content);
        console.log("---------------------------------\n");

      } catch (err) {
        console.error("Diagnostic engine error:", err.message);
      } finally {
        await client.stop();
      }
    }
  }, { auto: true }],
});

export { expect };