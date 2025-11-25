const { test, expect } = require('@playwright/test');

test('Dojo Toolkit Range Slider Validation', async ({ page }) => {
  await page.goto('https://dojotoolkit.org/documentation/tutorials/1.9/sliders/demos/simple.php');

  const horizontalValue = page.locator('#horizontalSlider .dijitSliderValue');
  const verticalValue = page.locator('#verticalSlider .dijitSliderValue');

  if (await horizontalValue.count() === 0 && await verticalValue.count() === 0) {
    throw new Error('No horizontal or vertical slider value elements found on page');
  }

  if (await horizontalValue.count() > 0) {
    const hv = Number((await horizontalValue.textContent())?.trim() || '0');
    expect(hv).toBeGreaterThanOrEqual(0);
    expect(hv).toBeLessThanOrEqual(100);
  }

  if (await verticalValue.count() > 0) {
    const vv = Number((await verticalValue.textContent())?.trim() || '0');
    expect(vv).toBeGreaterThanOrEqual(0);
    expect(vv).toBeLessThanOrEqual(100);
  }
});
