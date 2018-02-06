FROM node:8-alpine
MAINTAINER STARTX "dev@startx.fr"

ENV  SXAPI_VERSION=0.1.7 \
     NODE_ENV=development \
     APP_PATH=/usr/src/app \
     CONF_PATH=/conf \
     DATA_PATH=/data

ENV SUMMARY="Small an eXtensible API framework to build small and flexible microservices using a single configuration file" \
    DESCRIPTION="SXAPI $SXAPI_VERSION available as docker container is a base platform for \
building and running your API projects"

LABEL summary="$SUMMARY" \
      description="$DESCRIPTION" \
      io.k8s.description="$DESCRIPTION" \
      io.k8s.display-name="sxapi $NODEJS_VERSION" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="sxapi,sxapi$SXAPI_VERSION" \
      fr.startx.component="sxapi-core-v$SXAPI_VERSION-docker" \
      name="startx/sxapi-$SXAPI_VERSION" \
      version="$SXAPI_VERSION" \
      maintainer="startx.fr <dev@startx.fr>" \
      help="For more information visit https://github.com/startxfr/sxapi-core"

RUN  mkdir -p $APP_PATH && \
     mkdir -p $CONF_PATH  && \
     apk update && apk upgrade && apk add git
COPY ./core $APP_PATH/core
COPY ./test $APP_PATH/test
COPY ./*.j* $APP_PATH/
COPY ./sxapi.json $CONF_PATH/sxapi.json

RUN  cd $APP_PATH \
 &&  npm install \
 &&  npm dedupe \
 &&  npm cache verify \
 &&  npm cache clean --force \
 &&  mkdir -p $CONF_PATH \
 &&  mkdir -p $DATA_PATH \
 &&  chown -R 1001:1001 $APP_PATH $CONF_PATH $DATA_PATH

USER 1001
EXPOSE 8080
WORKDIR $APP_PATH
ENTRYPOINT [ "npm" ]
CMD [ "start" ]
