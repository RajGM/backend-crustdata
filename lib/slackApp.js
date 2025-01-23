// slackApp.js

require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const { App } = require('@slack/bolt');

// 1) Create the Slack WebClient
const web = new WebClient(process.env.BOT_TOKEN);

// 2) Create the Bolt app instance (but don't start it here)
const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const CHANNEL_ID = 'C0883F6369L';
const USER_ID = 'U088A3TN7SN';     // Replace with the specific user ID to check in parent message

const { processQuery } = require('@lib/query.js');

// --- MESSAGES/TREAD FETCHING EXAMPLE ---
async function fetchNewMessagesAndThreads(lastProcessedTS, CHANNEL_ID) {

  const historyResult = await web.conversations.history({
    channel: CHANNEL_ID,
    oldest: lastProcessedTS,
    limit: 100,
  });

  const newParentMessages = historyResult.messages || [];

  // Array to store threads data
  const threadsData = [];

  for (const parentMsg of newParentMessages) {
    const threadMessages = [parentMsg];
    const parentTS = parentMsg.ts;

    // If there's a thread with replies, fetch them
    if (parentMsg.reply_count && parentMsg.reply_count > 1) {
      const repliesResult = await web.conversations.replies({
        channel: CHANNEL_ID,
        ts: parentTS,
        oldest: lastProcessedTS,
      });

      const allThreadMsgs = repliesResult.messages || [];
      // Exclude the parent message since it's already included
      const replyOnly = allThreadMsgs.filter(r => r.ts !== parentMsg.ts);
      replyOnly.reverse(); // Sort replies from oldest to newest
      threadMessages.push(...replyOnly);
    }

    // Sort thread messages by ascending timestamp
    threadMessages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

    // Add the thread to threadsData in desired format
    // You can format the message content here for Pinecone insertion (Markdown vs String)
    threadsData.push({
      parent: parentMsg,
      messages: threadMessages
    });

    // Update lastProcessedTS based on all messages in the thread
    for (const m of threadMessages) {
      if (parseFloat(m.ts) > parseFloat(lastProcessedTS)) {
        lastProcessedTS = m.ts;
      }
    }
  }

  // Return the updated timestamp and the threads data for further processing
  return { lastProcessedTS, threadsData };
}

// --- LIST ALL CHANNELS & USERS EXAMPLE ---
async function listAllChannelsAndUsers() {
  try {
    const channelsResult = await web.conversations.list({ limit: 1000 });
    for (const channel of channelsResult.channels) {
      console.log(`Name: ${channel.name}, ID: ${channel.id}`);
    }

    const usersResult = await web.users.list();
    for (const member of usersResult.members) {
      console.log(`Name: ${member.name}, ID: ${member.id}`);
    }
  } catch (error) {
    console.error("Error listing channels/users:", error);
  }
}

// --- BOT MENTION HANDLER ---
app.event('app_mention', async ({ event, say }) => {

  // Validate the channel, user, and mention
  if (event.channel !== CHANNEL_ID || event.user !== USER_ID || !isBotMentioned(event.text)) {
    console.log('Exiting due to channel mismatch, user is the bot, or bot not mentioned.');
    await say({
      text: 'Sorry, I can only respond in the designated channel with specific users.',
      thread_ts: event.ts,
    });
    return;
  }

  try {
    // Check if this is part of a thread
    console.log('Processing a thread response. Thread TS:', event.event_ts);

    const threadId = event.event_ts;

    // Fetch replies in the thread
    const repliesResult = await web.conversations.replies({
      channel: event.channel,
      ts: threadId,
      limit: 100,
    });

    console.log('Replies fetched:', repliesResult);

    const parentMessage = repliesResult.messages?.[0];
    if (!parentMessage) {
      console.log('No parent message found. Exiting.');
      return;
    }

    console.log('Parent message:', parentMessage);

    // If the parent message had a bot mention
    if (isBotMentioned(parentMessage.text)) {
      const allMessages = repliesResult.messages || [];
      const conversationArray = transformSlackMessages(allMessages);
      const userFollowUp = event.text || '';

      const answer = await processQuery(conversationArray, userFollowUp);

      await say({
        text: answer,
        thread_ts: threadId,
      });

      console.log('Reply sent successfully.');
    } else {
      console.log('Parent message did not mention the bot. Exiting.');
    }

  } catch (error) {
    console.error('Error responding to app_mention:', error);
  }
});


// --- THREAD REPLY HANDLER ---
app.message(async ({ message, say }) => {
  if (message.channel !== CHANNEL_ID && message.user !== USER_ID) return;

  if (message.thread_ts && message.thread_ts !== message.ts) {
    const threadId = message.thread_ts;

    try {
      const repliesResult = await web.conversations.replies({
        channel: message.channel,
        ts: threadId,
        limit: 100,
      });

      const parentMessage = repliesResult.messages?.[0];
      if (!parentMessage) return;

      // If parent had a mention (simplistic check)
      if (isBotMentioned(parentMessage.text)) {
        const allMessages = repliesResult.messages || [];
        const conversationArray = transformSlackMessages(allMessages);
        const userFollowUp = message.text || '';

        const answer = await processQuery(conversationArray, userFollowUp);

        await say({
          text: answer,
          thread_ts: threadId,
        });
      }
    } catch (err) {
      console.error('Error fetching parent message:', err);
    }
  }
});

/** 
 * Helper function to detect a bot mention in text
 * Adjust to your actual Bot ID or name. 
 */
function isBotMentioned(text) {
  if (!text) return false;
  // e.g., <@U123BOTID> or '@webapi'
  return text.includes('@webapi') || text.includes('<@U088MTBNGLS>');
}

// --- EXPORTS ---
// We export the 'app' (Bolt instance), the web client, and any functions we want to call elsewhere.
module.exports = {
  app,
  web,
  fetchNewMessagesAndThreads,
  listAllChannelsAndUsers,
};

/**
 * Transforms Slack messages into an array with role and content.
 * @param {Array} messages - Array of Slack message objects.
 * @returns {Array} Transformed array of objects with 'role' and 'content'.
 */
function transformSlackMessages(messages) {
  if (!Array.isArray(messages)) {
    console.error('Expected an array of messages.');
    return [];
  }

  return messages.map(msg => {
    let role;
    // Determine role based on user ID
    if (msg.user === 'USLACKBOT') {
      role = 'assistant';
    } else if (msg.user === 'U088A3TN7SN') {
      role = 'user';
    } else {
      // Default role or handle additional cases as needed
      role = 'user'; // or 'unknown'
    }

    return {
      role: role,
      content: msg.text || ''
    };
  });
}
