# Crustdata Support Agent

## Project Overview
This is a customer support chatbot for Crustdata's APIs, designed to provide intelligent responses and handle various interaction scenarios.

## Project Structure

```
project-root/
│
├── index.js          # Main application entry point
├── package.json      # Project dependencies and scripts
├── .env.local        # Environment configuration
├── .gitignore        # Git ignore file
│
├── lib/              # Core utility and helper libraries
│   ├── firebaseUtils.js     # Firebase interaction utilities
│   ├── firebaseConfig.js    # Firebase configuration
│   ├── functionCaller.js    # Function calling utilities
│   ├── helperFunction.js    # Generic helper functions
│   ├── query.js             # Query processing logic
│   ├── slackApp.js          # Slack integration
│   └── code-executor.js     # Code execution utilities
│
├── routes/           # Express route handlers
│   ├── chat/         # Chat-related routes
│   │   └── index.js  # Chat route handler
│   └── upload/       # File upload routes
│       └── index.js  # Upload route handler
│
└── Dockerfile        # Docker containerization configuration
```

## Key Components

### Main Application (`index.js`)
- Configures Express server
- Sets up routes for chat and upload
- Initializes Slack app
- Implements periodic cron job for message processing

### Routes

#### Chat Route (`routes/chat/index.js`)
- Endpoint: `/api/chat`
- Handles POST requests for query processing
- Validates input query
- Calls `processQuery` from `lib/query.js`

#### Upload Route (`routes/upload/index.js`)
- Endpoint: `/upload`
- Supports file processing and vector storage
- Handles file upload and update operations
- Integrates with Pinecone and Firebase

## Configuration

### Environment Variables
- Create a `.env.local` file with the following keys:
  - `PORT`: Express server port
  - `PORT_BOLT`: Slack app port
  - Slack and Firebase credentials

### Dependencies
- Express.js
- Slack Bolt
- Firebase
- Pinecone
- node-cron

## Deployment

### Local Development
1. Install dependencies: `npm install`
2. Set up `.env.local`
3. Run application: `npm start`

### Docker Deployment
1. Build image: `docker build -t crustdata-support .`
2. Run container: `docker run -p 3000:3000 crustdata-support`

## Features
- API documentation chatbot
- Slack message processing
- Vector-based knowledge management
- Periodic background task scheduling

## Future Roadmap
- Enhanced AI response generation
- Multi-channel support
- Advanced error handling


# Firebase Utilities

## `firebaseConfig.js`

### Overview
Configures and initializes Firebase Admin SDK for Firestore integration.

### Key Components
- Firebase Admin app initialization
- Firestore database connection
- Secure credential management via environment variables

### Configuration
- Requires environment variables:
  - `project_id`
  - `private_key`
  - `client_email`

### Exports
- `db`: Firestore database instance
- `admin`: Firebase Admin SDK
- `doc`, `getDoc`: Firestore document utilities

## `firebaseUtils.js`

### Firestore Utility Functions

#### `getLastProcessedTS()`
- Retrieves the last processed timestamp from Firestore
- Returns "0" if no timestamp exists
- Used for tracking Slack message processing

#### `updateLastProcessedTS(maxTS)`
- Updates the last processed timestamp in Firestore
- Merges new timestamp into metadata document

#### `saveSlackMessagesToFirebase(messages)`
- Saves new Slack messages to Firestore
- Filters messages based on timestamp
- Updates last processed timestamp

#### `saveFileVectorIdsToFirebase(fileName, vectorIds)`
- Saves vector IDs for a specific file
- Uses filename as document ID in `fileVectors` collection

#### `fetchFileVectorIdsFromFirebase(fileName)`
- Retrieves vector IDs for a specific file
- Returns empty array if no vectors found

### Collection References
- `metadataDocRef`: Tracks processing timestamps
- `vectorIdRef`: Stores file vector IDs
- `messagesColRef`: Stores Slack messages

## `helperFunction.js`

### External Service Integrations
- OpenAI for embeddings
- Pinecone for vector storage

### Configuration
- Initializes Pinecone index if not exists
- Uses environment variables for API keys
- Configures serverless index in AWS us-east-1

### Exports
- `openai`: OpenAI client
- `pinecone`: Pinecone client
- `pineconeIndex`: Configured Pinecone index

## Best Practices
- Securely manage credentials via `.env`
- Handle errors with try-catch blocks
- Use environment-specific configurations

# Crustdata Support Agent

## Project Overview
Customer support chatbot for Crustdata's APIs, with intelligent response handling and multiple integrations.

## Project Structure

```
project-root/
│
├── lib/              # Core utility libraries
│   ├── firebaseUtils.js     # Firestore interaction utilities
│   ├── firebaseConfig.js    # Firebase configuration
│   └── helperFunction.js   # External service integrations
│
└── ... (previous structure)
```

## Firebase Integration

### Key Utilities
- **Firestore Timestamp Tracking**: Manage processing timestamps
- **Slack Message Storage**: Save and retrieve Slack messages
- **Vector ID Management**: Store and fetch vector identifiers

### Configuration
- Secure credential management via environment variables
- Serverless Pinecone index configuration
- OpenAI and Pinecone client initialization

## Additional Details
[Refer to Firebase Utilities documentation for comprehensive details]

(Rest of the previous README remains the same)
```

The documentation provides a comprehensive overview of the Firebase-related utilities, their purpose, and key functions. Would you like me to elaborate on any specific aspect?


# Query Processing Module Documentation

## Overview
The query processing module is a critical component of the Crustdata Support Agent, responsible for handling complex query resolution, context retrieval, and AI-powered response generation.

## Module Responsibilities
The module manages the following key functionalities:
- Semantic search and context retrieval
- Embedding generation
- Dynamic response generation
- Conversation thread processing

## Core Functions

### `processQuery(history, query)`
Handles the primary query processing workflow with multiple stages of intelligence.

#### Workflow
1. **Function Generation Decision**
   - Evaluates whether the query requires function generation
   - Uses advanced decision-making algorithms

2. **Context Retrieval**
   - Generates embeddings for the query
   - Retrieves relevant context from Pinecone vector database
   - Uses top-5 most relevant matches

3. **Response Generation**
   - Generates responses using OpenAI's GPT-4o model
   - Supports two primary modes:
     a. Standard query response
     b. Function generation and execution

#### Parameters
- `history`: Conversation history array
- `query`: Current user query

#### Return Value
- Contextually relevant markdown-formatted response

### `transformConversations(threads)`
Transforms raw Slack thread data into a structured format suitable for processing.

#### Features
- Extracts parent message details
- Converts child messages to text
- Prepares data for embedding generation

### `insertEmbeddingsToSlackMessages(structuredThreads, openai, channel)`
Generates embeddings for Slack conversation threads.

#### Key Operations
- Concatenates parent and child messages
- Generates embeddings using OpenAI
- Prepares metadata for vector storage
- Creates unique thread identifiers

### `processFileToPinecone(fileName, fileURL)`
Processes external files for vector embedding and storage.

#### Process
1. Download file content
2. Chunk text using token-based approach
3. Generate embeddings for each chunk
4. Upsert vectors into Pinecone
5. Return generated vector IDs

## Error Handling
- Comprehensive error logging
- Graceful error propagation
- Detailed error messages for debugging

## Performance Considerations
- Token-based text chunking
- Efficient embedding generation
- Batch vector upserts
- Timeout management for function execution

## Security Measures
- Sandboxed code execution
- Temporary file management
- Controlled function generation


# Slack Integration Module Documentation

## Overview
The Slack integration module enables intelligent bot interactions, message processing, and context-aware response generation within Slack channels.

## Core Components
- Slack Web API Client
- Slack Bolt App
- Message Processing Handlers
- Conversation Transformation Utilities

## Configuration
### Required Environment Variables
- `BOT_TOKEN`: Slack bot authentication token
- `SLACK_SIGNING_SECRET`: Request verification
- `CHANNEL_ID`: Designated interaction channel
- `USER_ID`: Authorized user identifier

## Event Handlers

### App Mention Handler (`app.event('app_mention')`)
#### Functionality
- Validates channel and user
- Processes thread-based interactions
- Generates context-aware responses

#### Workflow
1. Validate mention context
2. Fetch thread replies
3. Transform conversation history
4. Generate AI response
5. Reply in thread

### Message Handler (`app.message`)
#### Features
- Thread-based message processing
- Contextual response generation
- User interaction tracking

## Utility Functions

### `fetchNewMessagesAndThreads(lastProcessedTS, CHANNEL_ID)`
#### Operations
- Retrieve new channel messages
- Process thread conversations
- Track message timestamps
- Prepare data for further processing

### `transformSlackMessages(messages)`
#### Functionality
- Convert Slack messages to standardized format
- Assign conversation roles
- Prepare for AI processing

### `isBotMentioned(text)`
#### Purpose
- Detect bot mentions in message text
- Support flexible mention patterns

## Message Processing Strategy
1. Channel and user validation
2. Thread context retrieval
3. Conversation history transformation
4. AI-powered response generation
5. Threaded response delivery

## Error Handling
- Comprehensive logging
- Graceful error management
- Configurable error responses

## Interaction Constraints
- Single channel operation
- User-specific interactions
- Mention-based activation

## Performance Considerations
- Efficient message fetching
- Minimal API call overhead
- Optimized message processing