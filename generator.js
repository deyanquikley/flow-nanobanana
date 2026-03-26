const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');

// Use stealth plugin
chromium.use(stealth);

async function run() {
    // Read prompts from prompts.txt
    const promptsPath = path.join(__dirname, 'prompts.txt');
    const prompts = fs.readFileSync(promptsPath, 'utf8').split('\n').filter(p => p.trim() !== '');

    console.log(`Loaded ${prompts.length} prompts.`);

    const userDataDir = path.join(__dirname, '.google-session');
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: ['--disable-blink-features=AutomationControlled'] 
    });
    const page = browserContext.pages().length > 0 ? browserContext.pages()[0] : await browserContext.newPage();

    // Navigate to the tool
    const currentUrl = page.url();
    if (!currentUrl.includes('/project/')) {
        console.log('Navigating to Flow (waiting up to 60s)...');
        await page.goto('https://labs.google/fx/tools/flow', { timeout: 60000 });

        // Handle landing page vs project page
        if (await page.locator('button:has-text("New project")').isVisible({ timeout: 10000 })) {
            console.log('Clicking "New project"...');
            await page.click('button:has-text("New project")');
            await page.waitForNavigation({ waitUntil: 'networkidle' });
        }
    } else {
        console.log('Already on a project page. Using current state.');
    }

    console.log('Ready to process prompts.');
    
    // Ensure output directory exists
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        console.log(`\n[${i + 1}/${prompts.length}] Processing: ${prompt}`);

        try {
            // 1. Inject prompt
            console.log('Entering prompt...');
            const promptInput = page.locator('div[role="textbox"]');
            await promptInput.waitFor({ state: 'visible' });
            await promptInput.fill(prompt);
            await page.waitForTimeout(500);

            // 2. Click Create
            console.log('Clicking Create...');
            const createButton = page.locator('button').filter({ has: page.locator('i:text("arrow_forward")') });
            await createButton.waitFor({ state: 'visible' });
            await createButton.click();

            console.log('Generation started. Waiting for completion (max 2 mins)...');
            
            // 3. Wait for the new tile to appear and progress to finish
            const firstTile = page.locator('div[role="listitem"]').first();
            await firstTile.waitFor({ state: 'visible', timeout: 30000 });

            // Wait for percentage to disappear (generation complete)
            const progressIndicator = firstTile.locator('div:has-text("%")');
            const resultImage = firstTile.locator('img');

            // Wait until image is visible and percentage is gone
            await resultImage.waitFor({ state: 'visible', timeout: 120000 });
            await progressIndicator.waitFor({ state: 'hidden', timeout: 30000 });

            console.log('Generation complete. Opening detail view...');

            // 4. Open Detail View and Download
            await firstTile.click();
            await page.waitForTimeout(1000); // Wait for animation

            console.log('Looking for Download button...');
            const downloadButton = page.getByRole('button', { name: /Download/i });
            await downloadButton.waitFor({ state: 'visible', timeout: 15000 });

            console.log('Starting download...');
            const [download] = await Promise.all([
                page.waitForEvent('download', { timeout: 30000 }),
                downloadButton.click(),
            ]);

            const fileName = `generation_${Date.now()}_${i}.mp4`;
            const filePath = path.join(outputDir, fileName);
            await download.saveAs(filePath);
            console.log(`SUCCESS: Saved to ${filePath}`);

            // 5. Go back to grid
            console.log('Returning to grid view...');
            const backButton = page.locator('button:has-text("arrow_back")').or(page.getByRole('button', { name: /Back/i }));
            if (await backButton.isVisible()) {
                await backButton.click();
            } else {
                await page.keyboard.press('Escape');
            }

            await page.waitForTimeout(2000);

        } catch (error) {
            console.error(`FAILED for prompt "${prompt}":`, error.message);
            // Attempt to recover
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }
    }

    console.log('All prompts processed.');
    // Keep browser open for review
    // await browserContext.close();
}

run().catch(console.error);
