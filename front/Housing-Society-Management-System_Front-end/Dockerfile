# Use official Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (for caching)
COPY package.json pnpm-lock.yaml ./

# Use node_modules instead of virtual store (classic layout)
RUN pnpm config set node-linker node-modules

# Install dependencies (top-level node_modules)
RUN pnpm install

# Copy all source files
COPY . .

# Build Next.js
RUN pnpm build

# Expose port 3000
EXPOSE 3000

# Start production server
CMD ["pnpm", "start"]
