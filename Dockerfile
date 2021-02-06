# The Base Image used to create this Image
FROM node:lts-alpine

# Create app directory, copy files and change workdir
COPY . /app
WORKDIR /app

# Tell docker to expose the application port
EXPOSE 2200

# Install dependencies
RUN npm install

# The Base command, This command should be used to start the container
# Remember, A Container is a Process.As long as the base process (started by base cmd) is live the Container will be ALIVE.
ENV NODE_ENV production
CMD ["npm", "start"]
