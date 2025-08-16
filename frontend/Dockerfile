FROM node:18-alpine

# Enable corepack (ships with Node.js 16+ and manages pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy only package files first (better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (respect lockfile if present)
RUN pnpm install --frozen-lockfile

# Copy rest of the application
COPY . .

# Expose frontend port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]

# FROM node:18-alpine

# # Install pnpm
# RUN npm install -g pnpm

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package.json ./

# # Install dependencies
# RUN pnpm install

# # Copy application code
# COPY . .

# # Expose port
# EXPOSE 3000

# # Start the application
# CMD ["pnpm", "run", "start"]
