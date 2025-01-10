const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateScript(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: prompt }
    ],
  });
  return response.choices[0].message.content;
}

generateScript("Write a Node.js script that reads a JSON file and validates its content against a schema.")
  .then(console.log)
  .catch(console.error);
