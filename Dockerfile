FROM quay.io/startx/nodejs:alpine3

ENV SX_VERSION="0.3.57" \
    SX_TYPE="service" \
    SX_SERVICE="sxapi" \
    SX_ID="startx/sxapi" \
    SX_NAME="Startx SXAPI (alpine)" \
    SX_SUMMARY="Small an eXtensible API framework to build small and flexible microservices using a single configuration file" \
    DESCRIPTION="SXAPI $SXAPI_VERSION available as docker container is a base platform for building and running your API projects" \
    SX_DEBUG=true \
    NODE_ENV=development \
    APP_PATH=/app \
    APP_PORT=8077 \
    CONF_PATH=/conf \
    DATA_PATH=/data \
    APP_MAIN=/app/app.js

LABEL name="startx/sxapi-$SXAPI_VERSION" \
      summary="$SX_SUMMARY" \
      description="$DESCRIPTION." \
      version="$SXAPI_VERSION" \
      release="1" \
      maintainer="Startx <dev@startx.fr>" \
      help="For more information visit https://github.com/startxfr/sxapi-core" \
      io.k8s.description="$DESCRIPTION" \
      io.k8s.display-name="$SX_NAME" \
      io.openshift.tags="startx,nodejs,sxapi,sxapi-$SXAPI_VERSION" \
      io.openshift.non-scalable="false" \
      io.openshift.min-memory="64Mi" \
      io.openshift.min-cpu="200m" \
      io.openshift.expose-services="$APP_PORT:sxapi-http" \
      io.openshift.s2i.destination="/tmp" \
      io.openshift.s2i.scripts-url="image:///s2i" \
      io.s2i.scripts-url="image:///s2i" \ 
      fr.startx.component="$SX_ID:$SXAPI_VERSION"

USER root
COPY ./s2i /s2i
COPY ./core $APP_PATH/core
COPY ./test $APP_PATH/test
COPY ./app.js $APP_PATH/app.js
COPY ./package.json $APP_PATH/package.json
COPY ./sxapi.yml $CONF_PATH/sxapi.yml

RUN  apk update && apk upgrade && apk add git python3 make gcc g++ \
 &&  mkdir -p $APP_PATH $CONF_PATH $DATA_PATH /.npm /.config \
 &&  cd $APP_PATH \
 &&  npm run build \
 &&  npm dedupe \
 &&  npm cache verify \
 &&  npm cache clean --force \
 &&  apk del make gcc g++ \
 &&  chgrp -R 0 $APP_PATH $CONF_PATH $DATA_PATH /s2i /.npm /.config \
 &&  chown -R 1001:0 $APP_PATH $CONF_PATH $DATA_PATH /s2i /.npm /.config \
 &&  chmod -R g=u $APP_PATH $CONF_PATH $DATA_PATH /s2i /.npm /.config

USER 1001

WORKDIR $APP_PATH

EXPOSE $APP_PORT

VOLUME $DATA_PATH

CMD [ "npm" , "run", "test:start" ]
