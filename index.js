require('dotenv').config();
require('module-alias/register');
const express = require('express');
const cors = require('cors');
const chatRoute = require('./routes/chat');
const uploadRouter = require('./routes/upload');
const cron = require('node-cron');  // Import node-cron

const { app: slackApp, fetchNewMessagesAndThreads } = require('@lib/slackApp');
const { getLastProcessedTS, updateLastProcessedTS } = require('@lib/firebaseUtil');

const CHANNEL_ID = 'C0883F6369L';

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
  const lastStoredTS = await getLastProcessedTS();
  const {lastProcessedTS, threadsData} = await fetchNewMessagesAndThreads('1736883900', CHANNEL_ID);
  formatAndLogConversations(threadsData);
  //format this in appropriate format threadsData and upsert to pinecone
  await updateLastProcessedTS(lastProcessedTS);

  // Schedule cron job to run every second for testing
  // cron.schedule('*/5 * * * * *', async () => {
  //   console.log('Cron job triggered: Fetching new messages and threads...');
  //   try {
  //     //await fetchNewMessagesAndThreads();
  //     //console.log('Successfully fetched new messages and threads.');
  //   } catch (err) {
  //     console.error('Error during cron job execution:', err);
  //   }
  // });

  console.log('Cron job scheduled to run every second.');
});

/**
 * Recursively logs objects and their nested 'messages' arrays.
 * @param {Array} items - Array of objects to log.
 * @param {number} depth - Current recursion depth for indentation (optional).
 */
/**
 * Logs parent objects and their nested child messages in a structured format.
 * @param {Array} items - Array of objects, each with a 'parent' object and a 'messages' array.
 * @param {number} depth - Current indentation depth (for formatting).
 */
function logNestedObjects(items, depth = 0) {
  if (!Array.isArray(items)) {
    console.error('Expected an array of objects.');
    return;
  }

  const indent = '  '.repeat(depth);

  items.forEach((obj, parentIndex) => {
    // Log parent label and its properties
    console.log(`${indent}parent ${parentIndex + 1}:`);
    if (obj.parent && typeof obj.parent === 'object') {
      Object.entries(obj.parent).forEach(([key, value]) => {
        // If value is an object or array, indicate it without printing all details
        if (typeof value === 'object' && value !== null) {
          console.log(`${indent}  ${key}: [object]`);
        } else {
          console.log(`${indent}  ${key}: ${value}`);
        }
      });
    } else {
      console.log(`${indent}  parent: ${obj.parent}`);
    }

    // Check and log child messages
    if (Array.isArray(obj.messages)) {
      obj.messages.forEach((child, childIndex) => {
        console.log(`${indent}  child ${childIndex + 1}:`);
        if (child && typeof child === 'object') {
          Object.entries(child).forEach(([key, value]) => {
            // If value is an object or array, indicate it without printing all details
            if (typeof value === 'object' && value !== null) {
              console.log(`${indent}    ${key}: [object]`);
            } else {
              console.log(`${indent}    ${key}: ${value}`);
            }
          });
        } else {
          console.log(`${indent}    child: ${child}`);
        }
      });
    } else {
      console.log(`${indent}  messages: None`);
    }

    console.log(''); // Extra line for readability between parents
  });
}

/**
 * Converts conversation threads into a structured format for Pinecone upsert and logs them.
 * @param {Array} threads - Array of conversation thread objects, each having a 'parent' and 'messages' array.
 * @param {string} channel - The channel name or identifier for metadata purposes.
 */
function formatAndLogConversations(threads, channel = "Q&A") {
  if (!Array.isArray(threads)) {
    console.error("Expected an array of threads.");
    return;
  }

  // Process each thread individually
  threads.forEach((thread, index) => {
    const { parent, messages } = thread;
    
    // Create a unique ID for the thread (e.g., using parent's timestamp)
    const threadId = parent?.ts ? `thread-${parent.ts}` : `thread-${index + 1}`;
    
    // Placeholder for embedding vector (in practice, generate using an embedding service)
    const embeddingPlaceholder = "[embedding vector]";

    // Collect child user IDs and texts
    const childUserIds = [];
    const childTexts = [];
    if (Array.isArray(messages)) {
      messages.forEach(child => {
        if (child.user) childUserIds.push(child.user);
        if (child.text) childTexts.push(child.text);
      });
    }

    // Construct metadata object
    const metadata = {
      channel: channel,
      parentUser: parent?.user || null,
      parentTs: parent?.ts || null,
      parentText: parent?.text || null,
      childUserIds: childUserIds,
      childTexts: childTexts,
      // Additional fields can be added as needed
    };

    // Create the structured record for Pinecone
    const pineconeRecord = {
      id: threadId,
      values: embeddingPlaceholder,  // In practice, this would be the actual embedding vector
      metadata: metadata
    };

    // Log the structured record
    console.log(`Structured Record for Thread ${index + 1}:`);
    console.log(JSON.stringify(pineconeRecord, null, 2));  // Pretty-print the object
    console.log('--------------------------------------------------');
  });
}
