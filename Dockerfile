FROM node:8-alpine
MAINTAINER STARTX "dev@startx.fr"

ENV  NODE_ENV=production \
     APP_PATH=/usr/src/app \
     CONF_PATH=/conf \
     DATA_PATH=/data
RUN  mkdir -p $APP_PATH && \
     mkdir -p $CONF_PATH  && \
     apk update && apk upgrade && apk add git
COPY ./core $APP_PATH/core
COPY ./*.j* $APP_PATH/
COPY ./sxapi.json $CONF_PATH/sxapi.json
COPY run.sh /bin/sxapi

RUN  cd $APP_PATH \
 &&  npm install -production \
 &&  npm dedupe \
 &&  npm cache verify \
 &&  npm cache clean --force \
 &&  mkdir -p $CONF_PATH \
 &&  mkdir -p $DATA_PATH \
 &&  chmod ugo+x /bin/sxapi \
 &&  chown -R node:node $APP_PATH /bin/sxapi $CONF_PATH $DATA_PATH

USER node:node
EXPOSE 8080
WORKDIR $APP_PATH
ENTRYPOINT [ "/bin/sxapi" ]
CMD [ "start" ]
