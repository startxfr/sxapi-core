FROM startx/sv-nodejs:fc21
MAINTAINER Christophe LARUE <dev@startx.fr>

ENV APP_DIR /app
ENV CONF_DIR /conf
ENV DATA_DIR /data
ENV LOG_DIR /logs

COPY *.j* $APP_DIR/
COPY core $APP_DIR/core
RUN cd $APP_DIR && npm install -production

EXPOSE 19777
VOLUME [$CONF_DIR, $LOG_DIR, $DATA_DIR]
ENTRYPOINT ["node", "/app/app.js"]