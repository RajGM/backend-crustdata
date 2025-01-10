//upsert 
//question
//LLM 
//client request and response 

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { getEncoding } = require("js-tiktoken");

async function ingestSingleFile(fileName) {
    // Initialize OpenAI and Pinecone clients
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    const indexName = 'crunchdata';
    const dimensions = 1536;
    const batchSize = 100;
    const maxTokensPerChunk = 1000;

    const enc = getEncoding('cl100k_base');

    // Check for existing indexes and create if necessary
    const indexesResponse = await pinecone.listIndexes();
    const existingIndexNames = indexesResponse.indexes.map(idx => idx.name);

    if (!existingIndexNames.includes(indexName)) {
        console.log(`Creating index "${indexName}"...`);
        await pinecone.createIndex({
            name: indexName,
            dimension: dimensions,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });
        console.log(`Index "${indexName}" created.`);
    } else {
        console.log(`Index "${indexName}" already exists. Skipping creation.`);
    }

    // Specify both index name and host
    const indexHost = "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io"; // Replace with actual host if needed
    const pineconeIndex = pinecone.index(indexName, indexHost);

    // Define chunking function
    function chunkTextByTokens(text, maxTokens) {
        const allTokens = enc.encode(text);
        const chunks = [];
        let start = 0;
        while (start < allTokens.length) {
            const end = Math.min(start + maxTokens, allTokens.length);
            const chunkTokens = allTokens.slice(start, end);
            const chunkText = enc.decode(chunkTokens);
            chunks.push(chunkText);
            start = end;
        }
        return chunks;
    }

    // Read the specific file content
    const docsDir = path.join(__dirname, './docs');
    const filePath = path.join(docsDir, fileName);
    if (!fs.existsSync(filePath)) {
        console.error(`File "${fileName}" not found in docs directory.`);
        return;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Chunk the file content
    const chunks = chunkTextByTokens(fileContent, maxTokensPerChunk);
    console.log(`File "${fileName}" split into ${chunks.length} chunks.`);

    const vectors = [];

    // For each chunk, get embedding and prepare vector for upsert
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: chunk
            });

            const [{ embedding }] = embeddingResponse.data;
            vectors.push({
                id: `${fileName}-${i}-${Date.now()}`,
                values: embedding,
                metadata: {
                    source: fileName,
                    text: chunk
                }
            });

            console.log(`Processed chunk ${i + 1}/${chunks.length} of "${fileName}".`);
        } catch (error) {
            console.error(`Error processing chunk ${i + 1} of "${fileName}":`, error);
        }
    }

    console.log(vectors)
    //pineconeIndex.upsert(vectors);
    
    console.log('Ingestion complete for file:', fileName);
}

const targetFileName = "dp1.md"; // Replace with the actual file name you want to process
ingestSingleFile(targetFileName).catch(console.error);
