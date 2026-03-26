/**
 * Navigates to the Flow tool and opens a new project if necessary.
 * @param {Page} page - The Playwright Page object.
 */
async function navigateToFlow(page) {
    const currentUrl = page.url();
    if (!currentUrl.includes('/project/')) {
        console.log('Navigating to Flow (waiting up to 60s)...');
        await page.goto('https://labs.google/fx/tools/flow', { timeout: 60000 });

        // Handle landing page vs project page
        if (await page.locator('button:has-text("New project")').isVisible({ timeout: 10000 })) {
            console.log('Clicking "New project"...');
            await page.click('button:has-text("New project")');
            await page.waitForNavigation({ waitUntil: 'networkidle' });
        }
    } else {
        console.log('Already on a project page. Using current state.');
    }
}

module.exports = navigateToFlow;
