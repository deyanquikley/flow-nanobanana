const path = require('path');

/**
 * Opens the detail view for a tile and downloads the resulting file.
 * @param {Page} page - The Playwright Page object.
 * @param {Locator} tile - The Playwright Locator for the tile to download.
 * @param {number} index - The index of the generation (for file naming).
 * @param {string} outputDir - The directory to save the download to.
 */
async function downloadResult(page, tile, index, outputDir) {
    console.log('Generation complete. Opening detail view...');
    await tile.click();
    await page.waitForTimeout(1000); // Wait for transition animation

    console.log('Looking for Download button...');
    const downloadButton = page.getByRole('button', { name: /Download/i });
    await downloadButton.waitFor({ state: 'visible', timeout: 15000 });

    console.log('Starting download...');
    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        downloadButton.click(),
    ]);

    const fileName = `generation_${Date.now()}_${index}.mp4`;
    const filePath = path.join(outputDir, fileName);
    await download.saveAs(filePath);
    console.log(`SUCCESS: Saved to ${filePath}`);
}

module.exports = downloadResult;
