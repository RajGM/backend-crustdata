# Use an official Node.js image as the base
FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application's source code
COPY . .

# Expose the port the app runs on (adjust if necessary)
EXPOSE 3000

# Define the command to run your app using npm. 
# Adjust the start script if your entry point differs.
CMD ["npm", "start"]
