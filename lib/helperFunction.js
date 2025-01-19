require('dotenv').config();
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const indexName = process.env.indexName;
const indexHost = process.env.indexHost;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.index(indexName, indexHost);

module.exports = {
    openai, pinecone, indexHost, indexName, pineconeIndex
}