FROM startx/sv-nodejs:fc21
MAINTAINER Christophe LARUE <dev@startx.fr>

ENV APP_PATH=/app CONF_PATH=/conf DATA_PATH=/data LOG_PATH=/logs
WORKDIR $APP_PATH

COPY *.j* $APP_PATH/
COPY core $APP_PATH/core
RUN cd $APP_PATH && npm install -production

EXPOSE 19777
VOLUME [$CONF_PATH, $LOG_PATH, $DATA_PATH]
ENTRYPOINT ["node", "/app/app.js"]