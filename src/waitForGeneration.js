/**
 * Waits for the generation to complete by monitoring new images on the page.
 * @param {Page} page - The Playwright Page object.
 * @param {Array<string>} oldSrcs - Array of previously existing image URLs.
 * @param {number} expectedCount - Total number of new generated images to expect.
 * @returns {Promise<Array<string>>} newSrcs - Array of newly generated image URLs.
 */
async function waitForGeneration(page, oldSrcs, expectedCount) {
    console.log(`Generation started. Waiting for ${expectedCount} new image(s) to complete (max 2 mins)...`);
    
    // Wait an initial 10 seconds for the generating UI to start
    await page.waitForTimeout(10000);

    // Wait for at least expectedCount new large images to be present
    await page.waitForFunction(({ old, count }) => {
        const currentSrcs = Array.from(document.querySelectorAll('img'))
            .filter(img => img.width > 100 && img.height > 100)
            .map(img => img.src);
        const newSrcs = currentSrcs.filter(src => !old.includes(src));
        return newSrcs.length >= count;
    }, { old: oldSrcs, count: expectedCount }, { timeout: 110000 });

    // Wait an extra couple of seconds for the UI to settle
    await page.waitForTimeout(2000);

    // Extract and return the new image srcs
    const newSrcs = await page.evaluate(({ old }) => {
        const currentSrcs = Array.from(document.querySelectorAll('img'))
            .filter(img => img.width > 100 && img.height > 100)
            .map(img => img.src);
        return currentSrcs.filter(src => !old.includes(src));
    }, { old: oldSrcs });
    
    return newSrcs;
}

module.exports = waitForGeneration;
