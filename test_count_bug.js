function simulateDownload(count) {
    console.log(`Simulating prompt generation. Config count: ${count}`);
    
    // Previous flawed logic in generator.js:
    let i = 0;
    
    // // 8. Download Result
    // const firstTile = getFirstTile();
    // await downloadResult(page, null, i, outputDir, config.quality);
    
    let downloaded = 1; // It only called downloadResult once.
    
    console.log(`Expected downloads: ${count}`);
    console.log(`Actual downloads: ${downloaded}`);
    
    if (downloaded !== count) {
        throw new Error(`Bug reproduced: Expected ${count} downloads, but got ${downloaded}.`);
    } else {
        console.log('Test passed.');
    }
}

try {
    simulateDownload(4);
} catch (err) {
    console.error(err.message);
}
