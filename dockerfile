# Dockerfile for Node.js App

# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --force

# Copy the rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 5000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
