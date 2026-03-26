const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

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
        // Expose function to get initial data (like default output path)
        await page.exposeFunction('getInitialData', () => {
            return {
                defaultOutputDir: path.resolve(__dirname, '..', 'output'),
            };
        });

        // Expose function to trigger Windows folder picker
        await page.exposeFunction('selectFolder', () => {
            try {
                const psCommand = `Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.Description = 'Select Output Directory'; if($f.ShowDialog() -eq 'OK') { $f.SelectedPath }`;
                const output = execSync(`powershell -Command "${psCommand}"`, { encoding: 'utf-8' });
                return output.trim();
            } catch (err) {
                console.error("Error opening folder picker:", err);
                return null;
            }
        });

        // Expose function to submit config
        await page.exposeFunction('submitConfig', (config) => {
            console.log('Configuration received (File: ' + config.promptFileName + ')');
            resolve(config);
        });
    });
}

module.exports = guiLauncher;
