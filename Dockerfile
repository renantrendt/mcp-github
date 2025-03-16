FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --quiet

# Copy the rest of the application
COPY . .

# Display directory structure for debugging
RUN ls -la

# Create dist directory if it doesn't exist
RUN mkdir -p dist

# Build the application
RUN npm run build

# Display the built files for debugging
RUN ls -la dist

# Set environment variables
ENV NODE_ENV=production

# Run the MCP server
CMD ["node", "dist/index.js"]
