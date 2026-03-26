const path = require('path');

/**
 * Opens the detail view for a specific generated image and downloads it.
 * @param {Page} page - The Playwright Page object.
 * @param {number} imageIndex - The index of the image to download (0 to count - 1).
 * @param {number} promptIndex - The index of the prompt.
 * @param {string} outputDir - The directory to save the download to.
 * @param {string} quality - The quality to download ('1k' or '2k').
 */
async function downloadResult(page, imageIndex, promptIndex, outputDir, quality = '1k') {
    console.log(`Generation complete. Opening detail view for image ${imageIndex + 1}...`);
    
    // Find the newest large image at the specific index
    const targetImage = await page.evaluateHandle((idx) => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const largeImgs = imgs.filter(img => img.width > 100 && img.height > 100);
        return largeImgs.length > idx ? largeImgs[idx] : null;
    }, imageIndex);

    if (!targetImage) {
        throw new Error("Could not find any generated image to click.");
    }

    await targetImage.click();
    await page.waitForTimeout(2000); // Wait for transition animation

    console.log('Opening Download menu...');
    const downloadButton = page.getByRole('button', { name: /Download/i });
    if (await downloadButton.isVisible()) {
        await downloadButton.click();
    } else {
        const fallbackBtn = page.locator('button').filter({ hasText: /Download/i }).first();
        if (await fallbackBtn.isVisible()) {
            await fallbackBtn.click();
        } else {
            console.log("Could not find Download button visibly. Trying generic aria-label...");
            await page.locator('button[aria-label="Download"], button[title="Download"]').first().click();
        }
    }

    console.log(`Selecting quality: ${quality}`);
    const qualityPrefix = quality === '2k' ? '2K' : '1K';
    const qualityOption = page.locator('[role="menuitem"]').filter({ hasText: qualityPrefix }).first();
    
    await qualityOption.waitFor({ state: 'visible', timeout: 5000 });
    
    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        qualityOption.click(),
    ]);

    const fileName = download.suggestedFilename() || `generation_${Date.now()}_${index}.png`;
    const filePath = path.join(outputDir, fileName);
    await download.saveAs(filePath);
    console.log(`SUCCESS: Saved to ${filePath}`);
}

module.exports = downloadResult;
