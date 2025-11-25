const { test, expect } = require('@playwright/test');

test('simple dojo horizontal slider test', async ({ page }) => {
  await page.goto('https://dojotoolkit.org/documentation/tutorials/1.9/sliders/demos/simple.php');

  const hslider = page.locator('.dijitSliderBarContainerH');
  const vslider = page.locator('.dijitSliderBarContainerV');

  // Click on the slider bar somewhere to the right
  await hslider.click({ position: { x: 80, y: 5 } });

  // The displayed value is inside the span with id="sliderValue"
  const value = await page.locator('#decValue').innerText();

  console.log("Slider horizaontal value:", value);

  // Assert slider value changed from default (0)
  expect(Number(value)).toBeGreaterThan(0);

  await vslider.click({ position: { x: 0, y: 80 } });

  // The displayed value is inside the span with id="sliderValue"
  const valueV = await page.locator('#vertValue').innerText();

  console.log("Slider vertical value:", valueV);

  // Assert slider value changed from default (0)
  expect(Number(valueV)).toBeGreaterThan(0);
});
