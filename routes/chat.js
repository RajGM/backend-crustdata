const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = 'crunchdata';
const indexHost = "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io"; // Replace with actual host if needed  
const pineconeIndex = pinecone.index(indexName, indexHost);

async function generateAnswer(openai, context, query) {
  // Construct messages for the chat completion request
  const messages = [
    {
      role: "system",
      content: "You are an expert software engineer who build all this api and documentation and should answers questions based on provided context and make sure to have the whole response in Markdown format."
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${query}`
    }
  ];

  const completionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
  });

  // Extract and return the answer text
  console.log(completionResponse.choices?.[0]?.message?.content?.trim())
  return completionResponse.choices?.[0]?.message?.content?.trim();
}

async function generateEmbeddingAndQuery(openai, pineconeIndex, query, topK = 5) {
  try {
    // Step 1: Generate the embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const [{ embedding }] = embeddingResponse.data;

    // Step 2: Query Pinecone with the generated embedding
    const queryResponse = await pineconeIndex.query({
      vector: embedding,
      topK: topK,
      includeMetadata: true,
      includeValues: false, // set to true if vector values are needed
    });

    return queryResponse;
  } catch (error) {
    console.error(`Error during embedding/query for "${query}":`, error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { query, history } = req.body;
    console.log(query)

    // Validate input
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    // Use the combined function to get Pinecone query response
    const queryResponse = await generateEmbeddingAndQuery(openai, pineconeIndex, query, 5);

    console.log(`Top results for "${query}":`);

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Combine texts from topK matches
      const retrievedContext = queryResponse.matches
        .map(match => match.metadata?.text || "")
        .join("\n\n");


      // Combine conversation history with retrieved context for richer context
      const conversationContext = history
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join("\n");
      const fullContext = `${conversationContext}\n\n${retrievedContext}`;

      // Generate answer with LLM using full conversation context
      const answer = await generateAnswer(openai, fullContext, query);
      console.log(`Answer: ${answer}`);
      return res.status(200).json({ answer });
    } else {
      console.log("Answer: No relevant information found.");
      return res.status(404).json({ error: 'No relevant information found.' });
    }

  } catch (error) {
    console.error(`Error processing query:`, error);
    // Return error details to the client
    return res.status(500).json({
      error: 'An error occurred while processing your request.',
      details: error.message || error
    });
  }
});


module.exports = router;
