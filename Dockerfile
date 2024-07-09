# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory within the container
WORKDIR /chicken

# Install tzdata package and set the timezone
RUN apk add --update tzdata && \
    cp /usr/share/zoneinfo/Asia/Tashkent /etc/localtime && \
    echo "Asia/Tashkent" > /etc/timezone && \
    apk del tzdata

# Copy the package.json files to the container
COPY package.json ./

# Install app dependencies using npm
RUN apk add --update curl && \
    npm install -g npm@latest && \
    npm install -g nodemon@latest && \
    npm install

# Copy the rest of the application code to the container
COPY . ./

# Set the timezone environment variable
ENV TZ="Asia/Tashkent"

# Run start command
CMD ["npm", "run", "build"]
# CMD ["npm", "run", "dev"]
