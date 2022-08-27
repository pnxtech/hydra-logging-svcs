# Syntax: ./build.sh
# Use --no-cache=true  when necessary
VERSION_TAG=$(<VERSION)
SERVICE_HOST=pnxtech
SERVICE_NAME=hydra-logging-svcs
docker buildx build --platform=linux/amd64,linux/arm64 --push --no-cache -t $SERVICE_HOST/$SERVICE_NAME:$VERSION_TAG .
