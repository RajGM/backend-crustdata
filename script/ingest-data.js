require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { getEncoding } = require("js-tiktoken");

// Initialize a Pinecone client with your API key
async function ingestData() {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
  });

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const indexName = 'crunchdata';  // Name of your index
  const dimensions = 1536;                  // e.g., 1536 for text-embedding-ada-002
  const batchSize = 100;                    // Number of vectors to upsert in each batch

  const enc = getEncoding('cl100k_base');
  const maxTokensPerChunk = 1000; // you can pick 500, 1000, 2000, etc.

  const existingIndexes = await pinecone.listIndexes();
  const existingIndexNames = existingIndexes.indexes.map(idx => idx.name);

  if (!existingIndexNames.includes(indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: dimensions,
      metric: 'cosine',
      // ... other configuration ...
    });
  } else {
    console.log(`Index "${indexName}" already exists. Skipping creation.`);
  }

  // For the Node.js SDK, you must specify both the index host and name.
  const pineconeIndex = pinecone.index(indexName, "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io");

  // 3. Read your documentation
  const docsDir = path.join(__dirname, './docs');
  const allFiles = fs.readdirSync(docsDir);

  // 4. Chunking function (very naive example)
  function chunkText(text, chunkSize = 500) {
    const tokens = text.match(/[\s\S]{1,500}/g) || [];
    return tokens;
  }

  function chunkTextByTokens(text, maxTokens) {
    // Convert entire text to token array
    const allTokens = enc.encode(text);

    const chunks = [];
    let start = 0;
    while (start < allTokens.length) {
      const end = Math.min(start + maxTokens, allTokens.length);
      // Slice out the tokens for this chunk
      const chunkTokens = allTokens.slice(start, end);
      // Convert the chunk tokens back to text
      const chunkText = enc.decode(chunkTokens);
      chunks.push(chunkText);
      start = end;
    }
    return chunks;
  }

  const vectors = [];

  for (const fileName of allFiles) {
    const filePath = path.join(docsDir, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    //const chunks = chunkText(fileContent);
    const chunks = chunkTextByTokens(fileContent, maxTokensPerChunk);

    for (let chunk of chunks) {
      // 5. Get embedding from OpenAI
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk
      });


      //console.log(embeddingResponse.data)
      const [{ embedding }] = embeddingResponse.data;

      // Prepare upsert data for Pinecone
      vectors.push({
        id: `${fileName}-${Date.now()}`, // unique ID
        values: embedding,
        metadata: {
          source: fileName,
          text: chunk
        }
      });
    }
  }

  fs.writeFileSync('vectors_output.json', JSON.stringify(vectors, null, 2), 'utf-8');

  // vectors.map((vector) => {
  //   pineconeIndex.upsert(vector);
  // });

  console.log('Ingestion complete!');
}

ingestData().catch(console.error);