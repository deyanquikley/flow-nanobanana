const path = require('path');
const fs = require('fs');

/**
 * Launches the local GUI dashboard and waits for user configuration.
 * @param {BrowserContext} context - The Playwright BrowserContext.
 * @param {Page} page - The Playwright Page object.
 * @returns {Promise<Object>} The configuration object from the GUI.
 */
async function guiLauncher(context, page) {
    const guiPath = `file://${path.join(__dirname, 'gui', 'index.html').replace(/\\/g, '/')}`;
    console.log('Opening Configuration Dashboard...');
    
    await page.goto(guiPath);

    return new Promise(async (resolve) => {
        // Expose function to get .txt files
        await page.exposeFunction('getPromptFiles', () => {
            const rootDir = path.join(__dirname, '..');
            return fs.readdirSync(rootDir).filter(f => f.endsWith('.txt'));
        });

        // Expose function to submit config
        await page.exposeFunction('submitConfig', (config) => {
            console.log('Configuration received:', config);
            resolve(config);
        });
    });
}

module.exports = guiLauncher;
