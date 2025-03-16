FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Run the MCP server
CMD ["node", "dist/index.js"]
