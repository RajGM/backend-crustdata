const {db, doc, getDoc} = require('./firebaseConfig');

// Firestore imports
const {
  collection,
  addDoc
} = require('firebase-admin/firestore');

// Define a doc location for your metadata (holding lastProcessedTS)
const metadataDocRef = db.collection('slackMetadata').doc('timestamps');

// A collection where we'll store each new Slack message
// (If you don't need to store messages, you can omit this.)
const messagesColRef = db.collection("slackMessages");

/**
 * Fetch the current lastProcessedTS from Firestore.
 * Returns "0" if not found.
 */
async function getLastProcessedTS() {
  try {
    // 2) Use .get() on the doc ref
    const snapshot = await metadataDocRef.get();
    if (!snapshot.exists) {
      console.log("No lastProcessedTS doc found, defaulting to '0'");
      return "0";
    }
    const data = snapshot.data();
    const ts = data.lastProcessedTS || "0";
    console.log("Fetched lastProcessedTS from Firestore:", ts);
    return ts;
  } catch (error) {
    console.error("Error fetching lastProcessedTS:", error);
    return "0";
  }
}

/**
 * updateLastProcessedTS
 * Merges { lastProcessedTS: maxTS } into the doc at metadataDocRef.
 * @param {string} maxTS - The new timestamp (string form)
 * @returns {Promise<void>}
 */
async function updateLastProcessedTS(maxTS) {
  try {
    await metadataDocRef.set({ lastProcessedTS: maxTS }, { merge: true });
    console.log(`Updated lastProcessedTS to ${maxTS}.`);
  } catch (error) {
    console.error("Error updating lastProcessedTS:", error);
  }
}

/**
 * Save Slack messages (array) to Firestore,
 * and update lastProcessedTS to the max ts found.
 */
async function saveSlackMessagesToFirebase(messages) {
  if (!messages || messages.length === 0) {
    console.log("No messages to save.");
    return;
  }

  try {
    // 1) Get current lastProcessedTS
    const currentTS = await getLastProcessedTS();
    const currentTsFloat = parseFloat(currentTS);

    // 2) Filter only new messages
    const newMessages = messages.filter(
      (msg) => parseFloat(msg.ts) > currentTsFloat
    );

    if (newMessages.length === 0) {
      console.log("No new messages since lastProcessedTS:", currentTS);
      return;
    }

    // 3) Add each new message to the "slackMessages" collection
    //    (Remove or adapt this if you don't need to store messages.)
    for (const msg of newMessages) {
      await addDoc(messagesColRef, {
        ...msg,
        savedAt: Date.now() // optional metadata
      });
    }

    // 4) Update lastProcessedTS to the highest ts
    const maxTS = newMessages.reduce((acc, msg) => {
      return parseFloat(msg.ts) > parseFloat(acc) ? msg.ts : acc;
    }, currentTS);

    await setDoc(metadataDocRef, { lastProcessedTS: maxTS }, { merge: true });
    console.log(
      `Saved ${newMessages.length} new messages. Updated lastProcessedTS to ${maxTS}.`
    );
  } catch (error) {
    console.error("Error saving Slack messages to Firestore:", error);
  }
}

module.exports = {
  getLastProcessedTS,
  updateLastProcessedTS,
  saveSlackMessagesToFirebase
};