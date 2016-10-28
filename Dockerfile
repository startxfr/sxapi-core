FROM startx/sv-nodejs:fc21
MAINTAINER Christophe LARUE <dev@startx.fr>

ENV APP_PATH /app
ENV CONF_PATH /conf
ENV DATA_PATH /data
ENV LOG_PATH /logs

EXPOSE 19777
VOLUME [$CONF_PATH, $LOG_PATH, $DATA_PATH, $APP_PATH]
ENTRYPOINT ["node", "/app/app.js"]