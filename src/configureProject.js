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
        
        // Flow uses Radix UI. First button (settingsButton) opens the main popover.
        // Inside the popover, there is a model select button we need to click.
        const activeDialog = page.locator('[role="dialog"], [data-radix-popper-content-wrapper]').last();
        
        // Find the specific button for model selection inside the dialog
        const modelDropdownTrigger = activeDialog.locator('button[role="combobox"], button[aria-haspopup]').filter({ hasText: /Nano Banana|Imagen/i }).first();
        
        if (await modelDropdownTrigger.isVisible()) {
            await modelDropdownTrigger.click();
            await page.waitForTimeout(500);
        } else {
            // Fallback: click any inner button that looks like a model trigger
            const genericTrigger = activeDialog.locator('button').filter({ hasText: /Nano Banana|Imagen/i }).first();
            if (await genericTrigger.isVisible()) await genericTrigger.click();
            await page.waitForTimeout(500);
        }

        // Now the dropdown should be open. Target the menu option.
        const modelLabel = config.model === 'nanopro' ? 'Pro' : '2'; // Less strict matching
        const modelItem = page.locator('[role="option"], [role="menuitem"]').filter({ hasText: new RegExp(`Nano Banana ${modelLabel}`, 'i') }).first();
        
        if (await modelItem.isVisible()) {
            await modelItem.click({ force: true });
            await page.waitForTimeout(500);
            
            // Re-open main settings popover if selecting the model completely closed everything
            if (!(await page.locator('button[role="tab"]').first().isVisible())) {
                await settingsButton.click();
                await page.waitForTimeout(500);
            }
        } else {
            console.log(`WARNING: Could not find model option for ${config.model}. Keeping current.`);
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
