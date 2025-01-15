// download.js
const https = require('https');
const fs = require('fs');
const url = 'https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json';

function downloadFile(fileUrl, outputLocationPath) {
  const file = fs.createWriteStream(outputLocationPath);
  https.get(fileUrl, (res) => {
    // Check for successful response
    if (res.statusCode !== 200) {
      console.error(`Download failed. Status code: ${res.statusCode}`);
      res.resume(); // consume the response data to free up memory
      return;
    }
    // Pipe the data to the file
    res.pipe(file);
    file.on('finish', () => {
      file.close(() => console.log('Download completed!'));
    });
  }).on('error', (err) => {
    console.error(`Download error: ${err.message}`);
  });
}

downloadFile(url, 'updated_regions.json');
