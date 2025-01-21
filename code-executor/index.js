const fs = require('fs');
const path = require('path');
require('dotenv').config();

const vm = require('vm');

const { openai, pineconeIndex } = require('@lib/helperFunction.js')

// Define the user query
const query = "How do I search for people given their current title, current company and location? make a sample request with appropriate parameters to test and show the results";

// Function to decide whether we need to generate and execute a function based on the query
async function shouldGenerateFunction(conversationHistory, latestQuery) {
    // Build the conversation context
    const historyMessages = conversationHistory? conversationHistory.map(msg => {
        return { role: msg.role, content: msg.content };
    }):[]; 
    
    const prompt = `You are an expert software engineer tasked with determining whether to generate and execute a dynamic function based on the user's latest query.
Consider the conversation history and the query carefully.
Respond with "true" if a function needs to be generated and executed, or "false" if it does not. Respond with only "true" or "false"—no additional text.

Latest User Query: "${latestQuery}"
`;

    try {
        // Construct the complete set of messages for the API call
        const messages = [
            { role: "system", content: "You answer yes/no questions with true or false." },
            ...historyMessages,
            { role: "user", content: prompt }
        ];

        // Call OpenAI's API with the appropriate model and prompt
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // or another suitable model
            messages: messages,
            temperature: 0.1, // low randomness for deterministic output
        });

        // Extract and clean the response
        const answer = response.choices?.[0]?.message?.content?.trim().toLowerCase();
        console.log("ANSWER IN PROMPT:", answer);
        return answer === "true";
    } catch (error) {
        console.error("Error determining if function should be generated:", error);
        // Fallback to a default decision
        return false;
    }
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

// Function to generate an answer using OpenAI's chat completion
async function generateAnswer(context, query) {
    const messages = [
        {
            role: "system",
            content: "You are an expert software engineer who builds APIs and documentation, and should answer questions based on provided context."
        },
        {
            role: "user",
            content: `Context:\n${context}\n\nQuestion: ${query} and reply in JSON format always`
        }
    ];

    const completionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" }
    });

    console.log("GENERATE ANSWER:",completionResponse.choices?.[0]?.message?.content);
    return completionResponse.choices?.[0]?.message?.content?.trim();
}

async function generateFunctionAndParams(query, context) {
    const prompt = `
You are an expert software engineer. Based on the following context and user query, generate a JavaScript function that will help answer the query. 
Make sure the generated code includes all necessary imports (using require statements) for Node.js 20 running on Alpine, libraries, generators and so on, make sure to ensure to use as less import as possible, and make sure to provide the function name and parameters to be passed to the function.
Don't use any packages, or lib or constructors that needs to be installed, just use the native Node.js modules.
Also, provide a JSON array of parameters that should be passed to this function. 

Context: ${context}
User Query: ${query}

Respond with a JSON object containing three keys:
- "code": The JavaScript function code as a string, including necessary imports.
- "params": An array of parameters to be passed to the function.
- "functionName": The name of the generated function.

Example response JSON:
{
  "code": "const { URLSearchParams } = require('url');\\nfunction generatedFunction(a, b) { return a + b; }",
  "params": [5, 3],
  "functionName": "generatedFunction"
}
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o", 
        messages: [
            { role: "system", content: "You answer requests with structured JSON responses." },
            { role: "user", content: prompt }
        ],
        temperature: 0, // deterministic output
        response_format: { type: "json_object" }
    });

    try {
        const content = response.choices?.[0]?.message?.content?.trim();
        const parsed = JSON.parse(content);
        return parsed;
    } catch (error) {
        console.error("Error parsing LLM response:", error);
        return null;
    }
}

async function generateEmbeddingAndQueryForConversation(openai, pineconeIndex, latestQuery, topK = 5, conversationHistory) {
    try {
        // Assume conversationHistory is an array of objects like { role: "user"/"assistant", content: "..." }

        // Step 1: Format the conversation history into a string
        const formattedHistory = conversationHistory
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        // Step 2: Combine the conversation history with the latest query
        // Since the latestQuery is not in history, we append it separately
        const combinedInput = formattedHistory
            ? `${formattedHistory}\nUser: ${latestQuery}`
            : `User: ${latestQuery}`;

        // Step 3: Generate the embedding for the combined input
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: combinedInput,
        });

        // Extract the embedding from the response
        const [{ embedding }] = embeddingResponse.data;

        // Step 4: Query Pinecone with the generated embedding
        const queryResponse = await pineconeIndex.query({
            vector: embedding,
            topK: topK,
            includeMetadata: true,
            includeValues: false, // set to true if vector values are needed
        });

        return queryResponse;
    } catch (error) {
        console.error(`Error during embedding/query for conversation + "${latestQuery}":`, error);
        throw error;
    }
}

module.exports = {
    shouldGenerateFunction,
    generateEmbeddingAndQuery,
    generateAnswer,
    generateFunctionAndParams,
    generateEmbeddingAndQueryForConversation
}
