# Use Apify's base image for JavaScript actors
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --omit=optional

# Copy source code
COPY . ./

# Run the actor
CMD ["node", "src/main.js"]
