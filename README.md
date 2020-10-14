# hydra-logging-svcs
Hydra Logging Service

A logging service for Hydra-enabled services which use the [hydra-plugin-hls](https://github.com/pnxtech/hydra-plugin-hls) module or directly send UMF messages.

## Logging to terminal

By default, hls logs to the terminal.  You can modify this behavior by updating the config/config.json logger.logToConsole entry to false.

```json
  "logger": {
    "logToConsole": false
  },
```

## Logging to file

Hls logs does not log to a file by default.  You can modify this behavior by updating the config/config.json logger.logToFile entry to true.

```json
  "logger": {
    "logToFile": true
  },
```

## Example docker compose entries:

```yaml
configs:
  hydra_logging_svcs_config:
    file: ./hydra-logging-svcs-config.json
```

```yaml
services:
  hydra-logging-svcs:
    image: hydra-logging-svcs:0.3.0
    networks:
      - servicenet
    depends_on:
      - redis
    configs:
      - source: hydra_logging_svcs_config
        target: /usr/src/app/config/config.json
    volumes:
      - ./logs:/logs
    deploy:
      replicas: 1
```

Note the use of the `volumes` branch above to denote that logs will be mapped and written to the outside of the container / cluster.

