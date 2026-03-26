/**
 * Enters a prompt into the Flow textbox and clicks the Create button.
 * @param {Page} page - The Playwright Page object.
 * @param {string} prompt - The prompt text to enter.
 */
async function processPrompt(page, prompt) {
    console.log('Entering prompt...');
    const promptInput = page.locator('div[role="textbox"]');
    await promptInput.waitFor({ state: 'visible' });
    await promptInput.fill(prompt);
    await page.waitForTimeout(500);

    const oldSrcs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
            .filter(img => img.width > 100 && img.height > 100)
            .map(img => img.src);
    });

    console.log('Clicking Create...');
    // Use the fixed specific selector to avoid strict mode violations
    const createButton = page.locator('button').filter({ 
        has: page.locator('i:text("arrow_forward")') 
    });
    await createButton.waitFor({ state: 'visible' });
    await createButton.click();
    
    return oldSrcs;
}

module.exports = processPrompt;
