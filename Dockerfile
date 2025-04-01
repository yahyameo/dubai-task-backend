# Use official Node.js image as the base
FROM node:18

# Accept build arguments
ARG MONGO_URI
ARG PORT
ARG GITHUB_PAT


# Set environment variables
ENV MONGO_URI=${MONGO_URI}
ENV PORT=${PORT}

# Echo the environment variables during the build process
RUN echo "MONGO_URI: ${MONGO_URI}" && \
    echo "PORT: ${PORT}"

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Configure npm authentication for GitHub Packages
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_PAT}" > ~/.npmrc

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port your NestJS app runs on
EXPOSE 80

# Start the application
CMD [ "node","dist/main.js" ]
