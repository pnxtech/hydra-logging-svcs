FROM node:8.9.1-alpine
MAINTAINER Carlos Justiniano cjus34@gmail.com
EXPOSE 121212
HEALTHCHECK --interval=5s --timeout=3s CMD curl -f http://localhost:121212/v1/hls/health || exit 1
RUN apk add --update curl build-base
RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
RUN apk add --update imagemagick ghostscript poppler-utils
RUN rm -rf /var/cache/apk/*
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install --production
ENTRYPOINT ["node", "hls-svcs"]
