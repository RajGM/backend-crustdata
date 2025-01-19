const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const vm = require('vm');

// Initialize OpenAI and Pinecone clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const indexName = 'crunchdata';
const indexHost = "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io"; // Replace with actual host if needed
const pineconeIndex = pinecone.index(indexName, indexHost);

// Define the user query
const query = "How do I search for people given their current title, current company and location? make a sample request with appropriate parameters to test and show the results";

// Function to decide whether we need to generate and execute a function based on the query
async function shouldGenerateFunction(conversationHistory, latestQuery) {
    // Build the conversation context
    const historyMessages = conversationHistory.map(msg => {
        return { role: msg.role, content: msg.content };
    });

    const prompt = `
You are an expert software engineer. Based on the entire conversation history and the following user query, determine if a dynamic function needs to be generated and executed to answer it.
Return only "true" or "false" without any additional text.

User Query: "${latestQuery}"
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
            temperature: 0, // low randomness for deterministic output
        });

        // Extract and clean the response
        const answer = response.choices?.[0]?.message?.content?.trim().toLowerCase();
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
            content: `Context:\n${context}\n\nQuestion: ${query}`
        }
    ];

    const completionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
    });

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

Example response:
{
  "code": "const { URLSearchParams } = require('url');\\nfunction generatedFunction(a, b) { return a + b; }",
  "params": [5, 3],
  "functionName": "generatedFunction"
}
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4", // update model name as needed
        messages: [
            { role: "system", content: "You answer requests with structured JSON responses." },
            { role: "user", content: prompt }
        ],
        temperature: 0, // deterministic output
        max_tokens: 300
    });

    // Parse JSON from the LLM's response
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

// Main execution flow
//(
async () => {
    // Determine if function generation is needed using LLM-based decision (from previous instructions)
    const decision = await shouldGenerateFunction(query);

    if (decision) {
        // Retrieve context, for example, documentation or Pinecone context
        const context = "How do I search for people given their current title, current company and location? Also make a mock request to the endpoint";

        // Generate function code and parameters dynamically
        const queryResponse = await generateEmbeddingAndQuery(openai, pineconeIndex, query, 5);
        const generationResult = await generateFunctionAndParams(query + " " + queryResponse, context);

        if (!generationResult) {
            console.error("Failed to generate function and parameters.");
            return;
        }

        const { code: generatedFunctionCode, params: params, functionName: functionName } = generationResult;

        // Save the generated code to a file
        const functionFilePath = path.join(__dirname, 'generatedFunction.js');
        fs.writeFileSync(functionFilePath, generatedFunctionCode);

        // Read and execute the generated function as before
        const readGeneratedFunctionCode = fs.readFileSync(functionFilePath, 'utf8');
        const sandbox = { console, require };
        vm.createContext(sandbox);

        try {
            vm.runInContext(readGeneratedFunctionCode, sandbox, { timeout: 1000 });
            const invocationCode = `${functionName}(${params.map(p => JSON.stringify(p)).join(', ')})`;
            const result = vm.runInContext(invocationCode, sandbox, { timeout: 1000 });
            console.log("Function Execution Result:", result);

            // Use the result in further context or responses as needed
            const answerContext = `Function executed with result: ${result}`;
            const answer = await generateAnswer(answerContext, query);
            console.log("Answer with function context:", answer);

        } catch (error) {
            console.error('Error during execution:', error);
        } finally {
            try {
                fs.unlinkSync(functionFilePath);
                console.log('Cleaned up generated function file.');
            } catch (unlinkError) {
                console.error('Error removing generated function file:', unlinkError);
            }
        }

    } else {
        // For queries not requiring function execution, directly generate an answer
        const context = "";  // Provide relevant context if needed
        const answer = await generateAnswer(context, query);
        console.log("Direct Answer:", answer);
    }
}//)//();