MAINTAINER STARTX "dev@startx.fr"
FROM node:8-alpine

ENV  NODE_ENV=production \
     APP_PATH=/usr/src/app \
     CONF_PATH=/conf \
     DATA_PATH=/data
RUN  mkdir -p $APP_PATH
COPY ./core $APP_PATH/core
COPY ./*.j* $APP_PATH/

WORKDIR $APP_PATH

RUN  npm install -production \
 &&  npm cache verify \
 &&  npm cache clean --force

USER node:node
EXPOSE 8080
CMD  npm start