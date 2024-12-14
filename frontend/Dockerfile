# Use the official Node.js image as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on (default for React is 3000)
EXPOSE 3000

# Start the React app when the container starts
CMD ["npm", "start"]
