FROM startx/sv-nodejs:fc23
MAINTAINER Christophe LARUE <dev@startx.fr>

ENV APP_PATH=/app CONF_PATH=/conf

COPY *.j* $APP_PATH/
COPY core $APP_PATH/core
RUN cd $APP_PATH && npm install -production

VOLUME $CONF_PATH
ENTRYPOINT ["node", "/app/app.js"]
