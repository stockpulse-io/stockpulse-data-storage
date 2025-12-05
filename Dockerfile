# Use a small & fast Node.js base image
FROM node:18-alpine

# Create app directory inside container
WORKDIR /app

# Copy dependency files first (for caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the full project
COPY . .

# Start your Node consumer service
CMD ["npm", "start"]