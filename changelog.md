# Changelog - Playwright Flow Automation

## [Unreleased]
- **Bug Fix**: Solved synchronization issue where `waitForGeneration.js` was resolving immediately due to seeing old images, causing subsequent prompts to re-download old results.
- **Refactor**: Changed image tracking logic to record `oldSrcs` in `processPrompt.js`, wait for `config.count` new `img.src` additions in `waitForGeneration.js`, and click the specific `targetSrc` in `downloadResult.js`.

### [Fixed & Refactored] - 2026-03-26 (Commit: 8922644)
- **Bug Fix**: Implemented looping behavior to download all generated images (1-4) based on the input configuration instead of just the first image.
- **Refactor**: Modified `downloadResult.js` to accept `imageIndex` to properly select the Nth generated image from the grid.
- **Fix**: Improved reliability of `waitForGeneration.js` by tracking large images instead of specific DOM containers.
- **Fix**: Fixed `downloadResult.js` failing to open the detail view by calculating and clicking the newly generated image element rather than relying on a potentially obsolete container locator.
- **Fix**: Handled the quality selection button click more robustly in `downloadResult.js` to handle text nested in distinct spans.
- **Refactor**: Maintained downloaded file extension accuracy using Playwright's `suggestedFilename()`.

### [Initial State] - 2026-03-26
- Initial implementation of `generator.js` with Full Stealth Mode and Download logic.
- Created `prompts.txt` and `package.json`.

### [Fixed] - 2026-03-26
- Fixed "strict mode violation" for the "Create" button by refining the locator to target the arrow_forward icon specifically. (Commit: c8bbd03)
- Fixed "strict mode violation" for Aspect Ratio and Image Count by using exact-match selectors ($=).

### [Refactored] - 2026-03-26
- Started modular refactoring of `generator.js`.
- Created `src/readPrompts.js` for reading input file. (Commit: bbd1f99)
- Created `src/initBrowser.js` for browser initialization. (Commit: 666e214)
- Created `src/navigateToFlow.js` for site navigation. (Commit: 09d46e7)
- Created `src/processPrompt.js` for prompt injection. (Commit: 2e87e26)
- Created `src/waitForGeneration.js` for progress monitoring. (Commit: 19b327f)
- Created `src/downloadResult.js` for downloading results. (Commit: cc9e450)
- Created `src/returnToGrid.js` for UI navigation. (Commit: df2bf21)
- Refactored `generator.js` to use modular architecture. (Commit: cc9d579)

### [Added] - 2026-03-26
- Created a premium GUI configuration dashboard (`src/gui/index.html`).
- Implemented `src/guiLauncher.js` to manage the GUI lifecycle.
- Implemented `src/configureProject.js` to apply UI settings (Model, Count, Ratio).
- Enabled 1K/2K quality selection in `src/downloadResult.js`.
