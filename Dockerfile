FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production --silent
COPY . .
CMD npm start