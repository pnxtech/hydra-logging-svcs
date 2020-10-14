# Syntax: ./build-debug.sh
# Use --no-cache=true when necessary
VERSION_TAG=$(<VERSION)
docker build -f Dockerfile.debug -t hydra-logging-svcs:$VERSION_TAG .
