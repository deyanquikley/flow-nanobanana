const fs = require('fs');
const path = require('path');

/**
 * Reads prompts from a text file, splitting by new lines.
 * @param {string} filePath - Path to the prompts file.
 * @returns {string[]} Array of prompts.
 */
function readPrompts(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Prompts file not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .map(p => p.trim())
        .filter(p => p !== '');
}

module.exports = readPrompts;
