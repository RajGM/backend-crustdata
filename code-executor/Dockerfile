# Use an official Node.js runtime as a parent image
FROM node:23-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies if any (for this script, dependencies are not required)
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Define the command to run the script
CMD [ "npm", "start" ]
