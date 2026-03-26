const path = require('path');
const fs = require('fs');

// Modular Imports
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

        // 3. Read prompts from GUI upload
        const rawText = config.promptsContent || '';
        const prompts = rawText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        
        if (prompts.length === 0) {
            console.log("No prompts found in the selected file.");
            process.exit(1);
        }
        console.log(`Loaded ${prompts.length} prompts from uploaded file: ${config.promptFileName}.`);

        // 4. Navigate to Flow
        await navigateToFlow(page);

        // 5. Apply UI Settings (Model, Count, Ratio)
        await configureProject(page, config);

        // Ensure custom output directory exists
        const finalOutputDir = config.outputPath || outputDir;
        if (!fs.existsSync(finalOutputDir)) {
            fs.mkdirSync(finalOutputDir, { recursive: true });
        }

        console.log(`Ready to process prompts. Saving to: ${finalOutputDir}`);

        let globalFileCounter = 1;

        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            console.log(`\n[${i + 1}/${prompts.length}] Processing: ${prompt}`);

            try {
                // 6. Process Prompt
                const oldSrcs = await processPrompt(page, prompt);

                // 7. Wait for Generation
                const newSrcs = await waitForGeneration(page, oldSrcs, config.count);

                // 8. Download Result
                for (let j = 0; j < Math.min(config.count, newSrcs.length); j++) {
                    await downloadResult(page, newSrcs[j], globalFileCounter, finalOutputDir, config.quality, config.filePrefix);
                    globalFileCounter++;
                    // 9. Return to Grid
                    await returnToGrid(page);
                    await page.waitForTimeout(1000);
                }

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
