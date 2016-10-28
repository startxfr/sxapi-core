FROM startx/sv-nodejs:fc21
MAINTAINER Christophe LARUE <dev@startx.fr>

ENV APP_DIR /app
ENV CONF_DIR /conf
ENV DATA_DIR /data
ENV LOG_DIR /logs

EXPOSE 19777
VOLUME [$CONF_DIR, $LOG_DIR, $DATA_DIR, $APP_DIR]
ENTRYPOINT ["node", "/app/app.js"]