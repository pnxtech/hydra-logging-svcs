FROM node:12-alpine
LABEL maintainer="Carlos Justiniano cjus@ieee.org"
EXPOSE 12000
#HEALTHCHECK --interval=5s --timeout=3s CMD curl -f http://localhost:12000/v1/hls/health || exit 1
RUN apk -U upgrade \
  && apk add --no-cache \
    curl \
    python3 \
    build-base \
RUN mkdir -p /logs
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install --production
ENTRYPOINT ["node", "hydra-logging-svcs.js"]
