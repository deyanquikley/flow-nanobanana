const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const path = require('path');

// Use stealth plugin
chromium.use(stealth);

/**
 * Initializes the browser context with persistence and stealth.
 * @param {string} userDataDir - Directory to store user data/session.
 * @param {boolean} headless - Whether to run in headless mode.
 * @returns {Promise<{context: BrowserContext, page: Page}>} The initialized context and page.
 */
async function initBrowser(userDataDir, headless = false) {
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        headless: headless,
        args: ['--disable-blink-features=AutomationControlled']
    });

    const page = browserContext.pages().length > 0 
        ? browserContext.pages()[0] 
        : await browserContext.newPage();

    return { context: browserContext, page };
}

module.exports = initBrowser;
