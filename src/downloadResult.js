const path = require('path');

/**
 * Opens the detail view for a tile and downloads the resulting file.
 * @param {Page} page - The Playwright Page object.
 * @param {Locator} tile - The Playwright Locator for the tile to download.
 * @param {number} index - The index of the generation.
 * @param {string} outputDir - The directory to save the download to.
 * @param {string} quality - The quality to download ('1k' or '2k').
 */
async function downloadResult(page, tile, index, outputDir, quality = '1k') {
    console.log('Generation complete. Opening detail view...');
    await tile.click();
    await page.waitForTimeout(1000); // Wait for transition animation

    console.log('Opening Download menu...');
    const downloadButton = page.getByRole('button', { name: /Download/i });
    await downloadButton.waitFor({ state: 'visible', timeout: 15000 });
    await downloadButton.click();

    console.log(`Selecting quality: ${quality}`);
    const qualityLabel = quality === '2k' ? /2K upscaled/i : /1K original size/i;
    const qualityOption = page.locator('[role="menuitem"]').filter({ hasText: qualityLabel });
    
    await qualityOption.waitFor({ state: 'visible', timeout: 5000 });
    
    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        qualityOption.click(),
    ]);

    const fileName = `generation_${Date.now()}_${index}.mp4`;
    const filePath = path.join(outputDir, fileName);
    await download.saveAs(filePath);
    console.log(`SUCCESS: Saved to ${filePath}`);
}

module.exports = downloadResult;
