FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=true

# Bundle app source
COPY . .
CMD [ "yarn", "start" ]
