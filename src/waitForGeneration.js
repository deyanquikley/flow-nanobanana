/**
 * Waits for the generation to complete by monitoring images on the page.
 * @param {Page} page - The Playwright Page object.
 */
async function waitForGeneration(page) {
    console.log('Generation started. Waiting for completion (max 2 mins)...');
    
    // Wait an initial 10 seconds for the generating UI to start
    await page.waitForTimeout(10000);

    // Wait for at least one large image (generated image) to be present
    await page.waitForFunction(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.some(img => img.width > 100 && img.height > 100);
    }, { timeout: 110000 });

    // Wait an extra couple of seconds for the UI to settle
    await page.waitForTimeout(2000);
}

module.exports = waitForGeneration;
