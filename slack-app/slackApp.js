require('dotenv').config();
const { WebClient } = require('@slack/web-api');

// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(process.env.BOT_TOKEN);
const { App } = require('@slack/bolt');
// The current date

const cron = require('node-cron');

// 1) Setup your Bolt app with signing secret & bot token
const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  try {
    await app.start(process.env.PORT_BOLT || 3003);

  } catch (error) {
    console.log(error);
    console.log(error.data.response_metadata);
  }

})();

app.command('/add2db', async ({ ack, say, client, body }) => {
  console.log("ADD DB DETECTED")
  
  await say({
    text: `I fetched channel info: ${JSON.stringify(channelInfo.channel, null, 2)}`,
  });
});

let lastProcessedTS = '1736883900';
const CHANNEL_ID = 'C0883F6369L';

async function fetchNewMessagesAndThreads() {
  console.log(`Fetching top-level messages in channel ${CHANNEL_ID} since ts=${lastProcessedTS}...\n`);

  // 1) Fetch new parent messages
  const historyResult = await web.conversations.history({
    channel: CHANNEL_ID,
    oldest: lastProcessedTS,
    limit: 100,
    // If you have many messages, handle pagination with next_cursor
  });

  const newParentMessages = historyResult.messages || [];
  console.log(`Fetched ${newParentMessages.length} new top-level messages.\n`);

  // 2) Iterate over each new parent message
  for (const parentMsg of newParentMessages) {
    const threadMessages = [];
    // The parent is the first message in the thread array
    threadMessages.push(parentMsg);

    // a top-level message has parentMsg.ts === parentMsg.thread_ts (Slack standard)
    const parentTS = parentMsg.ts;

    // Slack sets "reply_count" if there's a thread
    if (parentMsg.reply_count && parentMsg.reply_count > 1) {
      // 2a) Fetch replies for this thread
      const repliesResult = await web.conversations.replies({
        channel: CHANNEL_ID,
        ts: parentTS,
        oldest: lastProcessedTS,
        // You could also paginate replies if needed
      });

      const threadReplies = repliesResult.messages || [];

      // The API returns all thread messages (including the parent)
      // We can filter out the parent from the replies if needed:
      const replyOnly = threadReplies.filter(r => r.ts !== parentMsg.ts);

      // Add replies to the thread array
      // (In chronological order, Slack returns newest first by default, so you might reverse)
      replyOnly.reverse(); // make them oldest -> newest
      threadMessages.push(...replyOnly);

    }

    // 3) We now have an array of all messages in this thread. Let's upsert it to Pinecone
    // Optionally, ensure the array is sorted by timestamp ascending if you want strict order:
    threadMessages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

    //await upsertThreadToPinecone(threadMessages);

    // 4) Update our lastProcessedTS to the largest timestamp in the thread
    // We want to ensure we don't reprocess these messages next time
    for (const m of threadMessages) {
      if (parseFloat(m.ts) > parseFloat(lastProcessedTS)) {
        lastProcessedTS = m.ts;
      }
    }

  }

}

// 2) Function: List all channels and users
async function listAllChannelsAndUsers() {
  try {
    // List channels
    const channelsResult = await web.conversations.list({ limit: 1000 });
    console.log("\n=== Channels ===");
    for (const channel of channelsResult.channels) {
      console.log(`Name: ${channel.name}, ID: ${channel.id}`);
    }

    // List users
    const usersResult = await web.users.list();
    console.log("\n=== Users ===");
    for (const member of usersResult.members) {
      console.log(`Name: ${member.name}, ID: ${member.id}`);
    }
  } catch (error) {
    console.error("Error listing channels/users:", error);
  }
}

//bot support C088R691EHK
//rajgm U088A3TN7SN

// 2) Listen for app_mention events
app.event('app_mention', async ({ event, say }) => {
  try {
    // Extract the user's message (strip out the mention if needed)
    const userMessage = event.text;
    console.log(`User ${event.user} mentioned the bot: "${userMessage}"`);

    // Here, you could call an AI model or logic to produce a reply
    //const botReply = generateReply(userMessage);
    const botReply = userMessage;
    // 3) Reply in the same thread (if you want a threaded conversation)
    //    If no thread yet, Slack sets thread_ts = event.ts for the parent message
    await say({
      text: botReply,
      thread_ts: event.ts, // reply in the same thread
    });
  } catch (error) {
    console.error('Error responding to app_mention:', error);
  }
});

app.message(async ({ message, say }) => {
  // We only care if it's a "thread reply" (not a new top-level message)
  
  if (message.thread_ts && message.thread_ts !== message.ts) {
    const threadId = message.thread_ts;

    try {
      // 2a) Fetch the parent (very first) message in this thread
      const repliesResult = await web.conversations.replies({
        channel: message.channel,
        ts: threadId,
        limit: 1, // We only need the top-level parent
      });

      const parentMessage = repliesResult.messages?.[0];
      if (!parentMessage) {
        return; // No parent found, do nothing
      }

      // 2b) Check if parent message included the bot mention
      if (isBotMentioned(parentMessage.text)) {
        // => Continue the conversation in the same thread
        const userFollowUp = message.text || '';
        console.log(`User follow-up in thread ${threadId}: "${userFollowUp}"`);

        // Generate or craft your agent-style reply
        const response = `Agent mode: I'm listening! You said: "${userFollowUp}"`;

        await say({
          text: response,
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
 * In a real scenario, you may look for <@BOT_ID> or the bot's actual display name.
 */
function isBotMentioned(text) {
  if (!text) return false;
  // For demonstration, we just look for '@BotName'
  return ( text.includes('@webapi') || text.includes('@U088MTBNGLS') );
}