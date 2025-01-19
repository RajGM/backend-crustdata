require('dotenv').config();

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Assuming these dependencies are available in the module's scope
// const context = ...;
const { shouldGenerateFunction, generateEmbeddingAndQueryForConversation } = require('@code-executor/index.js');
const {openai, pineconeIndex} = require('@lib/helperFunction.js')

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

        if (decision) {
            const queryResponse = await generateEmbeddingAndQueryForConversation(openai, pineconeIndex, query, 5, history);

            const generationResult = await generateFunctionAndParams(query + " " + queryResponse, query); // history ----- FIX THIS LATER

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
                const invocationCode = `${functionName}(${params.map(p => JSON.stringify(p)).join(', ')})`;
                result = vm.runInContext(invocationCode, sandbox, { timeout: 1000 });
                console.log("Function Execution Result:", result);
            } catch (execError) {
                throw new Error('Error during generated function execution: ' + execError.message);
            } finally {
                try {
                    fs.unlinkSync(functionFilePath);
                    console.log('Cleaned up generated function file.');
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

module.exports = { processQuery };
