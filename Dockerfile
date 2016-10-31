FROM startx/sv-nodejs:fc23
MAINTAINER Christophe LARUE <dev@startx.fr>

ENV APP_PATH=/app CONF_PATH=/conf
VOLUME $CONF_PATH
VOLUME $APP_PATH
ENTRYPOINT ["node", "/app/app.js"]
