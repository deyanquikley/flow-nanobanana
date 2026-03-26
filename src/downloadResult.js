const path = require('path');

/**
 * Opens the detail view for a specific generated image and downloads it.
 * @param {Page} page - The Playwright Page object.
 * @param {string} targetSrc - The exact image URL to target and click.
 * @param {number} globalIndex - The global sequence number for the file.
 * @param {string} outputDir - The directory to save the download to.
 * @param {string} quality - The quality to download ('1k' or '2k').
 * @param {string} prefix - Optional filename prefix.
 */
async function downloadResult(page, targetSrc, globalIndex, outputDir, quality = '1k', prefix = '') {
    console.log(`Generation complete. Opening detail view for matching new image...`);
    
    // Find the specific image by exact src
    const targetImage = await page.evaluateHandle((src) => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.find(img => img.src === src);
    }, targetSrc);

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

    const suggested = download.suggestedFilename();
    const timestamp = Date.now();
    let fileName;
    
    const prefixPart = prefix ? `${prefix}_` : '';

    if (suggested) {
        const ext = path.extname(suggested);
        const base = path.basename(suggested, ext);
        fileName = `${globalIndex}_${prefixPart}${base}_${timestamp}${ext}`;
    } else {
        fileName = `${globalIndex}_${prefixPart}generation_${timestamp}.png`;
    }
    
    const filePath = path.join(outputDir, fileName);
    await download.saveAs(filePath);
    console.log(`SUCCESS: Saved to ${filePath}`);
}

module.exports = downloadResult;
