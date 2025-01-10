const express = require('express');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3002;

/**
 * Utility to run a script in a child process.
 * @param {string} scriptPath - The relative path to the script, e.g. "scripts/ingestData.js"
 * @returns {Promise<void>} Resolves on successful exit, rejects on non-zero exit code
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    // Spawn a child process, running "node scriptPath"
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Script "${scriptPath}" completed successfully.`);
        resolve();
      } else {
        reject(new Error(`❌ Script "${scriptPath}" failed with exit code: ${code}`));
      }
    });
  });
}

// Start the Express server
app.listen(PORT, async () => {
  console.log(`Express server running on port ${PORT}`);

  try {
    // Run your ingestion script(s). 
    // If you have multiple, run them in sequence or in parallel as needed.

    // 1) Run ingestion script
    //await runScript('./ingest-data.js');
    await runScript('./test-ingest-data.js');

    // // 2) Run other scripts in sequence
    // await runScript('scripts/otherScript1.js');
    // await runScript('scripts/otherScript2.js');

    console.log('All scripts ran successfully!');
  } catch (error) {
    console.error('Error running scripts:', error);
    // Decide how you want to handle script failures:
    // - Possibly shut down the server
    // - Or keep running the server but log the error
  }
});
