// Example Express route for /upload
const express = require('express');
const router = express.Router();
const { processFileToPinecone } = require('@lib/query.js');

router.post('/', express.json(), async (req, res) => {
  const { filename, fileUrl } = req.body;

  try {
    const resultMessage = await processFileToPinecone(filename, fileUrl);
    res.json({ message: 'File processed and upserted successfully', fileUrl });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process the file.' });
  }
});

module.exports = router;