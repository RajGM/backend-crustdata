require('dotenv').config();
require('module-alias/register');
const express = require('express');
const cors = require('cors');
const chatRoute = require('./routes/chat');
const uploadRouter = require('./routes/upload');

const { app: slackApp } = require('@lib/slackApp');

const app = express();
app.use(cors());
app.use(express.json());

// Attach the chat route
app.use('/api/chat', chatRoute);
app.use('/upload', uploadRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  try {
    await slackApp.start(process.env.PORT_BOLT || 3003);
    console.log('⚡️ Bolt app is running!');
  } catch (error) {
    console.log(error);
    console.log(error.data.response_metadata);
  }
  console.log(`Express server listening on port ${PORT}`);
});