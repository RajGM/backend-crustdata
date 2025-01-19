const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { shouldGenerateFunction, generateEmbeddingAndQueryForConversation, generateFunctionAndParams } = require('@code-executor/index.js');

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = 'crunchdata';
const indexHost = "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io"; // Replace with actual host if needed  
const pineconeIndex = pinecone.index(indexName, indexHost);

router.post('/', async (req, res) => {
  try {
    const { query, history } = req.body;

    // Validate input
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const decision = await shouldGenerateFunction(history, query);
    if (decision) {
      const queryResponse = await generateEmbeddingAndQueryForConversation(openai, pineconeIndex, query, 5, history);

      const generationResult = await generateFunctionAndParams(query + " " + queryResponse, context);

      if (!generationResult) {
        console.error("Failed to generate function and parameters.");
        return;
      }

      const { code: generatedFunctionCode, params: params, functionName: functionName } = generationResult;
      //###Do chain of thought once API KEYS Are shared by CrustData Team

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

      try {
        const queryResponse = await generateEmbeddingAndQueryForConversation(
          openai,
          pineconeIndex,
          query,
          5,
          history
        );

        if (queryResponse.matches && queryResponse.matches.length > 0) {
          // Combine texts from topK matches
          const retrievedContext = queryResponse.matches
            .map(match => match.metadata?.text || "")
            .join("\n\n");

          // // Combine conversation history with retrieved context for richer context
          // const conversationContext = history
          //   .map(msg => ${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content})
          //   .join("\n");
          // const fullContext = ${conversationContext}\n\n${retrievedContext};

          // Generate answer with LLM using retrieved context and conversation history
          const answer = await generateAnswer(openai, retrievedContext, history, query);

          // Send successful response with the generated answer
          return res.status(200).json({ answer });
        } else {
          // No relevant information found in Pinecone matches
          return res.status(404).json({ error: 'No relevant information found.' });
        }
      } catch (error) {
        console.error("Error processing request:", error);
        // Respond with a 500 status code and an error message
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
      }

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
