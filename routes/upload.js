// Example Express route for /upload
const express = require('express');
const router = express.Router();
const { testData } = require('@lib/vectorProcessing/ingest-data');

router.post('/', express.json(), async (req, res) => {
  const { filename, content } = req.body;
  console.log(`Received file: ${filename}`);
  console.log(testData())
  // Process the file content as needed, e.g., save to disk or parse
  res.json({ message: 'File received successfully', filename });
});

module.exports = router;