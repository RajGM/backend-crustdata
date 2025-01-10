require('dotenv').config();
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

async function main() {
    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone client and obtain the index reference
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = 'crunchdata';
    const indexHost = "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io"; // Replace with actual host if needed  
    const pineconeIndex = pinecone.index(indexName, indexHost);

    // Define queries of varying difficulty
    // const queries = {
    //     easy: "What are the remaining credits?",
    //     medium: "How can I check my remaining credits for this billing period?",
    //     hard: "What endpoint returns the remaining credits and how is it accessed?",
    //     irrelevant: "What is the weather forecast for tomorrow?"
    // };

    const queries = {
        test:"How do I search for people given their current title, current company and location?",
    }

    async function generateAnswer(openai, context, query) {
        // Construct messages for the chat completion request
        const messages = [
            {
                role: "system",
                content: "You are an expert software engineer who build all this api and documentation and should answers questions based on provided context."
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
        return completionResponse.choices?.[0]?.message?.content?.trim();
    }

    for (const [level, query] of Object.entries(queries)) {
        console.log(`\n=== Query (${level}): ${query} ===`);

        try {
            // Generate embedding for the query
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: query,
            });
            const [{ embedding }] = embeddingResponse.data;

            // Query Pinecone with the query embedding
            const queryResponse = await pineconeIndex.query({
                vector: embedding,
                topK: 5,  // retrieve top 3 most similar vectors
                includeMetadata: true,
                includeValues: false, // set to true if you need the actual vector values
            });

            // Print out results
            console.log(`Top results for "${query}":`);
            //console.log(queryResponse);
            if (queryResponse.matches && queryResponse.matches.length > 0) {
                // Combine texts from topK matches
                const context = queryResponse.matches
                    .map(match => match.metadata?.text || "")
                    .join("\n\n");

                // Use generateAnswer function to get a refined response
                const answer = await generateAnswer(openai, context, query);
                console.log(`Answer: ${answer}`);
            } else {
                console.log("Answer: No relevant information found.");
            }

        } catch (error) {
            console.error(`Error processing query "${query}":`, error);
        }
    }
}

main().catch(console.error);

