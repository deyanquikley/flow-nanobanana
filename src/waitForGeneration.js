/**
 * Waits for the generation to complete by monitoring the first tile's progress.
 * @param {Page} page - The Playwright Page object.
 */
async function waitForGeneration(page) {
    console.log('Generation started. Waiting for completion (max 2 mins)...');
    
    const firstTile = page.locator('div[role="listitem"]').first();
    await firstTile.waitFor({ state: 'visible', timeout: 30000 });

    // Wait for percentage to disappear (generation complete)
    const progressIndicator = firstTile.locator('div:has-text("%")');
    const resultImage = firstTile.locator('img');

    // Wait until image is visible and percentage is gone
    await resultImage.waitFor({ state: 'visible', timeout: 120000 });
    await progressIndicator.waitFor({ state: 'hidden', timeout: 30000 });
}

module.exports = waitForGeneration;
