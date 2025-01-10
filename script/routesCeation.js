require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Uses OpenAI to extract API endpoint details in JSON format from Markdown content.
 * @param {string} markdown - The Markdown content of an API documentation file.
 * @returns {Promise<object[]>} - Extracted endpoints as JSON objects.
 */
// const ApiEndpointExtraction = z.object(z.array(
//     z.object({
//         endpoint: z.string(),
//         request: z.object({
//             method: z.string(),
//             url: z.string(),
//             headers: z.record(z.string()).optional(),
//             parameters: z.any().optional(),
//         }).optional(),
//         response: z.object({
//             schema: z.any().optional(),
//             format: z.string().optional(),
//         }).optional(),
//         auth_required: z.boolean().optional(),
//     })
// ));

async function extractEndpointsFromMarkdown(markdown) {
    const prompt = `You are an expert API documentation engineer. Given the following unstructured Markdown content, extract all API endpoints in a structured JSON format. 
  Each extracted object should include:
  - endpoint name
  - request method, URL, headers, parameters
  - response schema with format details
  - a flag indicating if authorization is required
  
  Markdown Content:
  ${markdown}
  
  Response Format: JSON
  {
  "endpoint": "url_endpoint",
  "auth_required": "true or false",
  "para": [{ "name": "", "type": "", "required": true/false, "description": "" }],
  "request": { "method": "", "url": "", "headers": {}, "query_parameters": {}, "body": ... },
  "response": {
     "200": { "description": "", "schema": { ... }, "format": "" },
     "401": { ... },
     "404": { ... },
     ...
  },
  "error": [{ "code": 400, "description": "" }, ...]
};
  `
  ;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // specify appropriate model version
        messages: [
            { role: "system", content: "You are an expert API documentation parser." },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
    });

    return completion.choices[0].message.content;
}

/**
 * Uses OpenAI to generate a Node.js client function for a given endpoint.
 * @param {object} endpoint - The endpoint details as a JSON object.
 * @returns {Promise<string>} - The generated client function code.
 */
async function generateClientFunction(endpoint) {
    const prompt = `You are an expert software engineer. Given the following API endpoint details in JSON format:
  ${JSON.stringify(endpoint, null, 2)}
  
  Please write a robust Node.js function using axios to call this API endpoint. The function should:
  - Accept necessary parameters as arguments
  - Configure the request (URL, method, headers, parameters/body)
  - Include error handling for network and API errors
  - Follow industry best practices for readability and maintainability
  
  Provide the full function code as your response.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",  // Using GPT-4 for improved code generation
        messages: [
            { role: "system", content: "You are a senior-level Node.js developer specializing in API client code." },
            { role: "user", content: prompt }
        ],
        max_tokens: 500  // Adjust depending on function complexity
    });

    return response.choices[0].message.content.trim();
}


async function main() {
    const docsDir = path.join(__dirname, './docs/');
    const allFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

    // Specify the single Markdown file path
    const filePath = path.join(__dirname, 'docs', 'dp1.md');
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }
    const markdownContent = fs.readFileSync(filePath, 'utf-8');

    //console.log(markdownContent)
    // Extract endpoints from the Markdown content
    const endpoints = await extractEndpointsFromMarkdown(openai, markdownContent);
    console.log("Extracted endpoints:", endpoints);

    // Generate and display client functions for each extracted endpoint
    // for (const endpoint of endpoints) {
    //     const clientFunctionCode = await generateClientFunction(openai, endpoint);
    //     console.log(`\nGenerated client function for endpoint "${endpoint.name}":\n`);
    //     console.log(clientFunctionCode);
    // }

    /*
    for (const fileName of allFiles) {
        const filePath = path.join(docsDir, fileName);
        const markdownContent = fs.readFileSync(filePath, 'utf-8');

        console.log(`\nProcessing file: ${fileName}`);

        // Extract endpoints from the Markdown file
        const endpoints = await extractEndpointsFromMarkdown(markdownContent);
        console.log(`Extracted endpoints:`, endpoints);

        // For each endpoint, generate a client function
        for (const endpoint of endpoints) {
            const clientFunctionCode = await generateClientFunction(endpoint);
            console.log(`\nGenerated client function for ${endpoint.name || "Unnamed Endpoint"}:\n`);
            console.log(clientFunctionCode);
        }
    }
*/

}

main().catch(console.error);
