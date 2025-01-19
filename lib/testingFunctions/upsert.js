require('dotenv').config();
const fs = require('fs');
const { Pinecone } = require('@pinecone-database/pinecone');
const path = require('path');
const { z } = require('zod');

async function main() {
  // Initialize Pinecone client
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

  const indexName = 'crunchdata';
  const indexHost = process.env.PINECONE_INDEX_HOST || "crunchdata-8h8qecx.svc.aped-4627-b74a.pinecone.io";
  const pineconeIndex = pinecone.index(indexName, indexHost);

  // Read the vectors from the JSON file
  const vectorsFilePath = path.join(__dirname, 'vectors_output.json');
  if (!fs.existsSync(vectorsFilePath)) {
    console.error(`File not found: ${vectorsFilePath}`);
    return;
  }

  const vectorsData = fs.readFileSync(vectorsFilePath, 'utf-8');
  let vectors;
  try {
    vectors = JSON.parse(vectorsData);
  } catch (e) {
    console.error("Error parsing vectors JSON:", e);
    return;
  }

  const batchSize = 100;  // Adjust batch size as necessary
  const upsertPromises = [];

  // Split vectors into batches and prepare upsert promises
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    upsertPromises.push(batch)
    //upsertPromises.push(pineconeIndex.upsert(batch));
  }

  try {
    // Execute all upsert promises concurrently
    await Promise.all(upsertPromises.map((chunk) => pineconeIndex.upsert(chunk)));

    console.log(`Successfully upserted ${upsertPromises.length} batches.`);
  } catch (error) {
    console.error('Error during batch upsert:', error);
  }

}

main().catch(console.error);

function vectorValidators() {

  // Define the Zod schema for a single vector
  const VectorSchema = z.object({
    id: z.string(),
    values: z.array(z.number()),
    metadata: z.object({
      source: z.string(),
      text: z.string(),
    })
  });

  // Function to validate vectors from a JSON file
  function validateVectors(filePath) {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    // Read and parse the JSON file
    let vectors;
    try {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      vectors = JSON.parse(fileData);
    } catch (error) {
      console.error("Error reading or parsing JSON file:", error);
      return;
    }

    // Ensure the data is an array
    if (!Array.isArray(vectors)) {
      console.error("The JSON file does not contain an array of vectors.");
      return;
    }

    // Validate each vector against the schema
    const validationResults = vectors.map((vector, index) => {
      const result = VectorSchema.safeParse(vector);
      return { index, valid: result.success, errors: result.success ? null : result.error.errors };
    });

    // Log results
    const invalidResults = validationResults.filter(r => !r.valid);
    if (invalidResults.length === 0) {
      console.log("All vectors are valid and conform to the schema.");
    } else {
      console.log(`Found ${invalidResults.length} invalid vector(s):`);
      invalidResults.forEach(({ index, errors }) => {
        console.log(`- Vector at index ${index} has errors:`, errors);
      });
    }
  }

  // Define the path to your vectors JSON file
  const vectorsFilePath = path.join(__dirname, 'vectors_output.json');

  // Run validation
  validateVectors(vectorsFilePath);
}

function testUpsert() {
  // Example data generation function, creates many (id, vector) pairs
  const generateExampleData = () =>
    Array.from({ length: RECORD_COUNT }, (_, i) => {
      return {
        id: `id-${i}`,
        values: Array.from({ length: RECORD_DIMENSION }, (_, i) => Math.random()),
      };
    });


  const RECORD_COUNT = 5;
  const RECORD_DIMENSION = 128;

  // A helper function that breaks an array into chunks of size batchSize
  const chunks = (array, batchSize = 200) => {
    const chunks = [];

    for (let i = 0; i < array.length; i += batchSize) {
      chunks.push(array.slice(i, i + batchSize));
    }

    return chunks;
  };

  const exampleRecordData = generateExampleData();
  const recordChunks = chunks(exampleRecordData);
  console.log(recordChunks)

  //await Promise.all(recordChunks.map((chunk) => index.upsert(chunk)));
}