FROM node:8.9.1-alpine
MAINTAINER Carlos Justiniano cjus34@gmail.com
EXPOSE 12000
HEALTHCHECK --interval=5s --timeout=3s CMD curl -f http://localhost:12000/v1/hls/health || exit 1
RUN apk add --update curl
RUN rm -rf /var/cache/apk/*
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install --production
ENTRYPOINT ["node", "hls-svcs"]
