require('dotenv').config();

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { getEncoding } = require("js-tiktoken");

// Assuming these dependencies are available in the module's scope
// const context = ...;
const { shouldGenerateFunction, generateEmbeddingAndQueryForConversation, generateFunctionAndParams } = require('@code-executor/index.js');
const { openai, pineconeIndex } = require('@lib/helperFunction.js')

/**
 * Generates an answer from OpenAI using provided context, conversation history, and the latest query.
 *
 * @param {Object} openai - OpenAI API client instance.
 * @param {string} context - Context retrieved from Pinecone or other sources.
 * @param {Array} conversationHistory - Array of conversation objects [{ role: "user"/"assistant", content: "..." }, ...].
 * @param {string} latestQuery - The most recent user query (not included in history).
 * @returns {Promise<string>} - The generated answer in Markdown format.
 */
async function generateAnswer(openai, context, conversationHistory, latestQuery) {
    // Initialize messages with a system instruction
    const messages = [
        {
            role: "system",
            content: "You are an expert software engineer who builds APIs and documentation. Answer questions based on the provided context, and ensure the whole response is in Markdown format."
        }
    ];

    // Add conversation history as separate message objects
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            // Push each message from history preserving role and content
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });
    }

    // Add the final user message containing context and the latest query
    messages.push({
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${latestQuery}`
    });

    try {
        // Create the chat completion with the assembled message sequence
        const completionResponse = await openai.chat.completions.create({
            model: "gpt-4o",  // Update model name if necessary
            messages: messages,
        });

        // Extract and return the answer text
        const answer = completionResponse.choices?.[0]?.message?.content?.trim();
        return answer;
    } catch (error) {
        console.error("Error generating answer:", error);
        throw error;
    }
}

async function processQuery(history, query) {
    try {
        const decision = await shouldGenerateFunction(history, query);
        //use open ai function calling -> check if needs to be called -> if yes -> get para via RAG then call it -> if no return the answer

        if (false) {
            const queryResponse = await generateEmbeddingAndQueryForConversation(openai, pineconeIndex, query, 5, history);

            const generationResult = await generateFunctionAndParams(queryResponse, query); // history ----- FIX THIS LATER

            if (!generationResult) {
                throw new Error("Failed to generate function and parameters.");
            }

            const { code: generatedFunctionCode, params, functionName } = generationResult;
            // DO CHAIN OF THOUGHT HERE
            // Save the generated code to a file
            const functionFilePath = path.join(__dirname, 'generatedFunction.js');
            fs.writeFileSync(functionFilePath, generatedFunctionCode);

            // Prepare sandbox and execute generated function
            const readGeneratedFunctionCode = fs.readFileSync(functionFilePath, 'utf8');
            const sandbox = { console, require };
            vm.createContext(sandbox);

            let result;
            try {
                vm.runInContext(readGeneratedFunctionCode, sandbox, { timeout: 1000 });
                console.log('Generated function loaded successfully:', readGeneratedFunctionCode);
                const invocationCode = `${functionName}(${params.map(p => JSON.stringify(p)).join(', ')})`;
                console.log('Invoking generated function:', invocationCode);
                result = vm.runInContext(invocationCode, sandbox, { timeout: 1000 });
            } catch (execError) {
                throw new Error('Error during generated function execution: ' + execError.message);
            } finally {
                try {
                    fs.unlinkSync(functionFilePath);
                } catch (unlinkError) {
                    console.error('Error removing generated function file:', unlinkError);
                }
            }

            const answerContext = `Function executed with result: ${result}`;
            const answer = await generateAnswer(answerContext, query);
            return answer;

        } else {
            const queryResponse = await generateEmbeddingAndQueryForConversation(
                openai,
                pineconeIndex,
                query,
                5,
                history
            );

            if (queryResponse.matches && queryResponse.matches.length > 0) {
                const retrievedContext = queryResponse.matches
                    .map(match => match.metadata?.text || "")
                    .join("\n\n");

                const answer = await generateAnswer(openai, retrievedContext, history, query);
                return answer;
            } else {
                throw new Error('No relevant information found.');
            }
        }
    } catch (error) {
        console.error("Error processing query:", error);
        throw error;  // Propagate error to caller for proper handling
    }
}

/**
 * Transforms threads to extract parent details and child messages as strings.
 * 
 * @param {Array} threads - Array of thread objects with 'parent' and 'messages'.
 * @returns {Array} - Array of structured thread objects.
 */
function transformConversations(threads) {
    if (!Array.isArray(threads)) {
        console.error("Expected an array of threads.");
        return [];
    }

    return threads.map(thread => {
        const { parent, messages } = thread;

        // Extract a subset of properties for the parent message
        const parentSubset = parent
            ? {
                user: parent.user,
                type: parent.type,
                ts: parent.ts,
                client_msg_id: parent.client_msg_id,
                text: parent.text,
                team: parent.team,
                thread_ts: parent.thread_ts,
                reply_count: parent.reply_count,
                reply_users_count: parent.reply_users_count,
                latest_reply: parent.latest_reply,
            }
            : null;

        // Convert each child message to its text content
        const messagesArray = Array.isArray(messages)
            ? messages.map(child => child.text || '')
            : [];

        return {
            parent: parentSubset,
            messages: messagesArray,
        };
    });
}

/**
 * Generates embeddings for structured threads and returns records for upsert.
 * 
 * @param {Array} structuredThreads - Array of structured thread objects (from transformConversations).
 * @param {Object} openai - Initialized OpenAI API client.
 * @param {string} channel - Channel identifier for metadata.
 * @returns {Promise<Array>} - Array of records with embeddings, metadata, and IDs.
 */
async function insertEmbeddingsToSlackMessages(structuredThreads, openai, channel) {
    const records = [];
    for (const [index, thread] of structuredThreads.entries()) {
        const { parent, messages } = thread;

        // Concatenate parent and child texts for embedding
        let combinedText = '';
        if (parent && parent.text) {
            combinedText += `${parent.text}\n`;
        }
        if (Array.isArray(messages) && messages.length > 0) {
            combinedText += messages.join('\n');
        }

        // Skip threads with no content to embed
        if (!combinedText.trim()) continue;

        // Generate embedding
        let embedding;
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: combinedText,
            });
            [{ embedding }] = embeddingResponse.data;;
        } catch (err) {
            console.error(`Error generating embedding for thread ${index + 1}:`, err);
            continue;
        }

        // Construct metadata
        const metadata = {
            channel: channel,
            parentUser: parent?.user || null,
            parentTs: parent?.ts || null,
            parentText: parent?.text || null,
            // Depending on use-case, you might store more metadata here
        };

        // Create unique ID for the thread
        const threadId = parent?.ts ? `thread-${parent.ts}` : `thread-${index + 1}`;

        // Prepare record
        records.push({
            id: threadId,
            values: embedding,
            metadata: metadata,
        });
    }

    return records;
}

/**
 * Upserts records into a specified Pinecone index.
 * 
 * @param {Array} records - Array of records with 'id', 'values', and 'metadata'.
 * @param {Object} pineconeIndex - Initialized Pinecone index client.
 * @returns {Promise<void>}
 */
async function upsertSlackRecords(records, pineconeIndex) {
    if (!Array.isArray(records) || records.length === 0) {
        console.warn('No records to upsert.');
        return;
    }

    try {
        await pineconeIndex.upsert(records);
        const ids = records.map(record => record.id);
        return ids;
    } catch (err) {
        console.error('Error upserting records to Pinecone:', err);
    }
}

/**
* Processes raw conversation threads by transforming them, generating embeddings, and upserting into Pinecone.
* 
* @param {Array} rawThreads - Array of raw thread objects.
* @param {Object} openai - Initialized OpenAI API client.
* @param {Object} pineconeIndex - Initialized Pinecone index client.
* @param {string} channel - Channel identifier for metadata (default is "Q&A").
* @returns {Promise<void>}
*/
async function processThreads(rawThreads, channel) {
    try {
        // 1. Transform raw conversations
        const structuredThreads = transformConversations(rawThreads);

        // 2. Generate embeddings and prepare records for upsert
        const records = await insertEmbeddingsToSlackMessages(structuredThreads, openai, channel);

        // 3. Upsert records into Pinecone
        await upsertSlackRecords(records, pineconeIndex);
        //upload to firebase
    } catch (err) {
        console.error("Error during processThreads execution:", err);
    }
}

module.exports = { processQuery, processThreads, processFileToPinecone, deleteVectorsByIds };

async function processFileToPinecone(fileName, fileURL) {
    try {
        // Initialize tokenizer encoding
        const enc = getEncoding('cl100k_base');
        const maxTokensPerChunk = 1000;

        // Ensure the Pinecone index exists (similar to ingestData logic)
        const dimensions = 1536;

        // Download file content from fileURL
        const response = await fetch(fileURL);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        const fileContent = await response.text();

        // Token-based chunking function
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

        const chunks = chunkTextByTokens(fileContent, maxTokensPerChunk);
        const vectors = [];
        const ids = [];  // Array to store generated IDs

        // Process each chunk: generate embedding and prepare vector for Pinecone
        for (let chunk of chunks) {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: chunk
            });

            const [{ embedding }] = embeddingResponse.data;
            const id = `${fileName}-${Date.now()}`;  // Generate unique ID

            vectors.push({
                id, // unique ID
                values: embedding,
                metadata: {
                    source: fileName,
                    text: chunk,
                }
            });
            ids.push(id);
        }

        // Upsert vectors into Pinecone in batches if necessary
        if (vectors.length > 0) {
            await pineconeIndex.upsert(vectors);
            return ids;
        } else {
            console.warn(`No vectors generated for file ${fileName}.`);
        }

    } catch (error) {
        console.error('Error in processFileToPinecone:', error);
        throw error;
    }
}

/**
 * Deletes all vectors from Pinecone where metadata.source equals "dAPI2.md".
 * 
 * @param {Object} pineconeIndex - Initialized Pinecone index client instance.
 * @returns {Promise<void>}
 */
async function deleteVectorsByIds(ids) {
    try {
        console.log(ids)
        const ns = pineconeIndex.namespace('');

        if (ids.length <= 1) {
            await ns.deleteOne(ids[0])
        } else {
            await ns.deleteMany(ids);
        }
    } catch (error) {
        console.error(`Error deleting vectors with source ${ids}:`, error);
        throw error;
    }
}
