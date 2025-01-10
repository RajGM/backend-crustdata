const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'No query provided' });
    }

    // 1. Generate embedding for the user query
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: query
    });
    const userEmbedding = embeddingResponse.data.data[0].embedding;

    // 2. Query Pinecone for similar chunks
    const pinecone = new PineconeClient();
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENV
    });

    const pineconeIndex = pinecone.Index('crustdata-api-docs');
    const queryResponse = await pineconeIndex.query({
      queryRequest: {
        topK: 5, // retrieve top 5 relevant chunks
        vector: userEmbedding,
        includeMetadata: true
      }
    });

    // Extract relevant chunks
    const relevantChunks = queryResponse.matches.map(match => match.metadata.text);

    // 3. Construct the prompt with retrieved context
    // You can refine the prompt format to ensure best results
    const contextString = relevantChunks.join('\n\n---\n\n');
    const systemPrompt = `
You are a helpful assistant for Crustdata’s API. Use the following context to answer user questions about the API.
If you are unsure or the context is not relevant, say "I'm not sure" or provide a best guess.

Context:
${contextString}
    `;

    // 4. Call OpenAI GPT with context + user query
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7
    });

    const answer = completion.data.choices[0].message.content;
    return res.json({ answer });
  } catch (error) {
    console.error('Error in chat route:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
