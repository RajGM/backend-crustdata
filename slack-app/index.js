require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Catch-all handler for any HTTP method and any path
app.all('*', (req, res) => {
  console.log(`Received ${req.method} request on ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  // Check for Slack's URL verification challenge and respond appropriately
  if (req.body && req.body.type === 'url_verification' && req.body.challenge) {
    return res.status(200).send(req.body.challenge);
  }

  // For all other requests, send a generic confirmation
  res.status(200).json({
    message: 'Request received',
    method: req.method,
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
