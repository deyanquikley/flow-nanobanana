/**
 * Returns to the grid view from the detail view.
 * @param {Page} page - The Playwright Page object.
 */
async function returnToGrid(page) {
    console.log('Returning to grid view...');
    const backButton = page.locator('button:has-text("arrow_back")').or(page.getByRole('button', { name: /Back/i }));
    
    if (await backButton.isVisible()) {
        await backButton.click();
    } else {
        // Fallback: press Escape to close the detail view
        await page.keyboard.press('Escape');
    }
}

module.exports = returnToGrid;
