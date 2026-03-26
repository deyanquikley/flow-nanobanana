/**
 * Configures the Google Flow project based on user settings.
 * @param {Page} page - The Playwright Page object.
 * @param {Object} config - The configuration object (model, count, ratio).
 */
async function configureProject(page, config) {
    console.log('Applying project settings...');

    // 1. Open Settings Menu
    // Usually the button next to Create containing "Nano Banana" or "Imagen"
    const settingsButton = page.locator('button[id^="radix-"]').filter({ hasText: /Nano Banana|Imagen/i });
    await settingsButton.waitFor({ state: 'visible' });
    await settingsButton.click();
    await page.waitForTimeout(500);

    // 2. Select Model
    if (config.model) {
        console.log(`Selecting model: ${config.model}`);
        // Click the model dropdown inside settings if it's nested, 
        // but based on subagent, the first click might have opened it already 
        // or we need to click the specific model row.
        const modelLabel = config.model === 'nanopro' ? 'Nano Banana Pro' : 'Nano Banana 2';
        const modelItem = page.locator('[role="menuitem"]').filter({ hasText: modelLabel });
        if (await modelItem.isVisible()) {
            await modelItem.click();
            await page.waitForTimeout(500);
            // Re-open settings if it closed after selection
            if (!(await page.locator('[role="tab"]').first().isVisible())) {
                await settingsButton.click();
                await page.waitForTimeout(500);
            }
        }
    }

    // 3. Select Image Count
    if (config.count) {
        console.log(`Setting image count to: ${config.count}`);
        // Use ends-with selector to avoid partial matches
        const countTab = page.locator(`button[role="tab"][id$="-trigger-${config.count}"]`);
        await countTab.click();
        await page.waitForTimeout(300);
    }

    // 4. Select Aspect Ratio
    if (config.ratio) {
        console.log(`Setting aspect ratio to: ${config.ratio}`);
        const ratioId = config.ratio === 'vertical' ? 'PORTRAIT' : 'LANDSCAPE';
        // Use ends-with selector to avoid partial matches (e.g. LANDSCAPE vs LANDSCAPE_4_3)
        const ratioTab = page.locator(`button[role="tab"][id$="-trigger-${ratioId}"]`);
        await ratioTab.click();
        await page.waitForTimeout(300);
    }

    // Close settings menu by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
    console.log('Settings applied.');
}

module.exports = configureProject;
