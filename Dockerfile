FROM node:8-alpine
ENV NODE_ENV=production ENV APP_PATH=/usr/src/app CONF_PATH=/conf
RUN mkdir -p $APP_PATH
COPY ./core $APP_PATH/core
COPY ./*.j* $APP_PATH/
WORKDIR $APP_PATH
RUN npm install -production && npm cache verify && npm cache clean --force
EXPOSE 8080
CMD npm start
