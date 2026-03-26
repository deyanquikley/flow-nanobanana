const path = require('path');
const fs = require('fs');

// Modular Imports
const readPrompts = require('./src/readPrompts');
const initBrowser = require('./src/initBrowser');
const navigateToFlow = require('./src/navigateToFlow');
const processPrompt = require('./src/processPrompt');
const waitForGeneration = require('./src/waitForGeneration');
const downloadResult = require('./src/downloadResult');
const returnToGrid = require('./src/returnToGrid');

async function run() {
    const userDataDir = path.join(__dirname, '.google-session');
    const promptsFile = path.join(__dirname, 'prompts.txt');
    const outputDir = path.join(__dirname, 'output');

    try {
        // 1. Read prompts
        const prompts = readPrompts(promptsFile);
        console.log(`Loaded ${prompts.length} prompts.`);

        // 2. Initialize Browser
        const { context, page } = await initBrowser(userDataDir);

        // 3. Navigate to Flow
        await navigateToFlow(page);

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        console.log('Ready to process prompts.');

        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            console.log(`\n[${i + 1}/${prompts.length}] Processing: ${prompt}`);

            try {
                // 4. Process Prompt
                await processPrompt(page, prompt);

                // 5. Wait for Generation
                await waitForGeneration(page);

                // 6. Download Result
                const firstTile = page.locator('div[role="listitem"]').first();
                await downloadResult(page, firstTile, i, outputDir);

                // 7. Return to Grid
                await returnToGrid(page);

                // Delay between prompts
                await page.waitForTimeout(2000);

            } catch (error) {
                console.error(`FAILED for prompt "${prompt}":`, error.message);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
            }
        }

        console.log('\nAll prompts processed successfully.');

    } catch (error) {
        console.error('Critical error during execution:', error);
    }
}

run();
