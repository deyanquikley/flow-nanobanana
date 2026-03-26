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

// New GUI & Config Imports
const guiLauncher = require('./src/guiLauncher');
const configureProject = require('./src/configureProject');

async function run() {
    const userDataDir = path.join(__dirname, '.google-session');
    const outputDir = path.join(__dirname, 'output');

    try {
        // 1. Initialize Browser
        const { context, page } = await initBrowser(userDataDir, false);

        // 2. Launch GUI Dashboard to get User Configuration
        const config = await guiLauncher(context, page);
        console.log('Starting automation with config:', config);

        // 3. Read prompts based on GUI selection
        const promptsFile = path.join(__dirname, config.promptFile);
        const prompts = readPrompts(promptsFile);
        console.log(`Loaded ${prompts.length} prompts from ${config.promptFile}.`);

        // 4. Navigate to Flow
        await navigateToFlow(page);

        // 5. Apply UI Settings (Model, Count, Ratio)
        await configureProject(page, config);

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        console.log('Ready to process prompts.');

        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            console.log(`\n[${i + 1}/${prompts.length}] Processing: ${prompt}`);

            try {
                // 6. Process Prompt
                await processPrompt(page, prompt);

                // 7. Wait for Generation
                await waitForGeneration(page);

                // 8. Download Result
                const firstTile = page.locator('div[role="listitem"]').first();
                await downloadResult(page, firstTile, i, outputDir, config.quality);

                // 9. Return to Grid
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
