FROM node:8-alpine
MAINTAINER STARTX "dev@startx.fr"

ENV  NODE_ENV=development \
     APP_PATH=/usr/src/app \
     CONF_PATH=/conf \
     DATA_PATH=/data
RUN  mkdir -p $APP_PATH
COPY ./core $APP_PATH/core
COPY ./test $APP_PATH/test
COPY ./*.j* $APP_PATH/

WORKDIR $APP_PATH

RUN  npm install \
 &&  npm cache verify \
 &&  npm cache clean --force

USER node:node
EXPOSE 8080
ENTRYPOINT  "npm start"
