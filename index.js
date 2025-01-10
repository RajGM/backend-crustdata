require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoute = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

// Attach the chat route
app.use('/api/chat', chatRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
