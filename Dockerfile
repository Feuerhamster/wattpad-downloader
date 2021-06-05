# The Base Image used to create this Image
FROM node:lts-alpine

# Create app directory, copy files and change workdir
COPY . /app
WORKDIR /app

# Tell docker to expose the application port
EXPOSE 2200

# Node.js production environment
ENV NODE_ENV production

# Install dependencies (https://docs.npmjs.com/cli/v7/commands/npm-ci)
RUN npm ci

# The Base command, This command should be used to start the container
# Remember, A Container is a Process. As long as the base process (started by base cmd) is live the Container will be ALIVE.
CMD ["npm", "start"]
