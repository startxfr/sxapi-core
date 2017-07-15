FROM node:8-alpine
ENV NODE_ENV=development
RUN mkdir -p /usr/src/app
COPY app /usr/src/app
WORKDIR /usr/src/app
RUN npm install && npm cache verify && npm cache clean --force
EXPOSE 8080
CMD npm start
