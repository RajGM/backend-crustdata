const { App, ExpressReceiver, HTTPReceiver } = require('@slack/bolt');
const { FileInstallationStore } = require("@slack/oauth");

const receiver = new ExpressReceiver({
  signingSecret: process.env.SIGNING_SECRET,
  endpoints: '/slack/events'
});

// const appSlack = new App({
//   signingSecret: process.env.SIGNING_SECRET,
//   clientId: process.env.CLIENT_ID,
//   clientSecret: process.env.SIGNING_SECRET,
//   stateSecret: process.env.SLACK_STATE_SECRET,//what is this
//   scopes: ["channels:history", "chat:write", "commands"],
//   installationStore: new FileInstallationStore(),
//   token: process.env.BOT_AUTH_TOKEN,
//   receiver
// });

const app = new App({
  token: process.env.BOT_AUTH_TOKEN,
  receiver: new HTTPReceiver({
    signingSecret: process.env.SIGNING_SECRET,
    customPropertiesExtractor: (req) => {
      return JSON.stringify({
        message: 'Request received',
        method: req.method,
        path: req.originalUrl,
      });
    }
  }),
});

app.use(async ({ logger, context, next }) => {
  logger.info(context);
  await next();
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info('⚡️ Bolt app is running!');
})();

appSlack.message('hello', async ({ message, say }) => {
  await say(`Hi there, <@${message.user}>!`);
});

(async () => {
  await appSlack.start(process.env.PORT || 3002);
  console.log('⚡️ Bolt app is running!');
})();
