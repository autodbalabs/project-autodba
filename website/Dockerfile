# Stage 1: Build the SvelteKit app using Bun
FROM oven/bun:latest AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb to install dependencies first
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the SvelteKit app
RUN bun run build

# Stage 2: Run the application in a minimal Bun environment
FROM oven/bun:latest AS runner

# Set the working directory
WORKDIR /app

# Copy only the built files and dependencies from the previous stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port (default SvelteKit port)
EXPOSE 3000

RUN ls -hal ./build

# Start the SvelteKit application
CMD ["bun", "run", "build/index.js"]
