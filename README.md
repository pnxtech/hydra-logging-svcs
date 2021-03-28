# hydra-logging-svcs

![](hydra-logging-svcs-logo.png)

Hydra Logging Service (HLS)

A logging service for Hydra-enabled services which use the [hydra-plugin-hls](https://github.com/pnxtech/hydra-plugin-hls) module or directly send UMF messages.

HLS is a distributed logging service intended to aggrigate log entries for running microservice instances within a cluster.

Log entries are posted using Hydra's underlying Redis Pub/Sub channels which are socket streams that are more efficient since they don't rely on HTTP.

HLS is light-weight and doesn't utilize a database, instead it simply logs to a file using [Bunyan](https://www.npmjs.com/package/bunyan), a simple and fast JSON logging library.  You can use the Bunyan command line tool to inspects logs or the [bunext](https://www.npmjs.com/package/bunext) tool which supports log queries.

> **Bonus Tip:** bunyan and bunext output is compatible with the excellent [jq](https://stedolan.github.io/jq/) tool for advanced JSON queries and syntax highlighting.

## Use with Docker
The recommended use of HLS is as a docker container in a docker swarm or Kubernetes cluster.

`docker pull pnxtech/hydra-logging-svcs:0.3.4`

Visit the docker hub [repo](https://hub.docker.com/repository/registry-1.docker.io/pnxtech/hydra-logging-svcs/tags?page=1
) for other versions.

## Configuration
#### Logging to terminal

By default, hls logs to the terminal.  You can modify this behavior by updating the config/config.json logger.logToConsole entry to false.

```json
  "logger": {
    "logToConsole": false
  },
```

#### Logging to file

Hls logs does not log to a file by default.  You can modify this behavior by updating the config/config.json logger.logToFile entry to true.

```json
  "logger": {
    "logToFile": true
  },
```

#### Sample logger configuration

The default configuration file enables both `logToFile` and `logToConsole`.  The config section provides the name of the logger and defines one stream which captures log entries at the lowest level (trace) and up.  This supports logging trace, info, debug, warn and fatal level entries. In a production setting you might only log warn and up to conserve disk space.

```json
  "logger": {
    "logToFile": true,
    "logToConsole": true,
    "config": {
      "name": "hls",
      "streams": [
        {
          "level": "trace",
          "path": "/logs/hls.log"
        }
      ]
    }
  }
```

#### Example docker compose entries:

```yaml
configs:
  hydra_logging_svcs_config:
    file: ./hydra-logging-svcs-config.json
```

```yaml
services:
  hydra-logging-svcs:
    image: hydra-logging-svcs:0.4.3
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

## Sample K8s config.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hydra-logging-svcs-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      component: hydra-logging-svcs
  template:
    metadata:
      labels:
        component: hydra-logging-svcs
    spec:
      containers:
        - name: hydra-logging-svcs
          image: pnxtech/hydra-logging-svcs:0.4.3
          # resources:
          #   limits:
          #     cpu: "1"
          #     memory: "128Mi"
          #   requests:
          #     cpu: "0.5"
          #     memory: "64Mi"
          ports:
            - containerPort: 12000
          volumeMounts:
            - name: hydra-logging-svcs-config-volume
              mountPath: /usr/src/app/config
            - name: hydra-logging-svcs-data-volume
              mountPath: /var/log
      volumes:
        - name: hydra-logging-svcs-config-volume
          configMap:
            name: hydra-logging-svcs-config
        - name: hydra-logging-svcs-data-volume
          hostPath:
            path: /Volumes/hydra-logging
            type: Directory
---
apiVersion: v1
kind: Service
metadata:
  name: hydra-logging-svcs-cluster-ip-service
spec:
  type: ClusterIP
  selector:
    component: hydra-logging-svcs
  ports:
    - port: 12000
      targetPort: 12000
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: hydra-logging-svcs-config
data:
  config.json: |-
    {
      "logger": {
        "logToFile": true,
        "logToConsole": true,
        "config": {
          "name": "hls",
          "streams": [
            {
              "level": "trace",
              "path": "/var/log/hls.log"
            }
          ]
        }
      },
      "hydra": {
        "serviceName": "hydra-logging-svcs",
        "serviceIP": "",
        "servicePort": 12000,
        "serviceType": "logging",
        "serviceDescription": "Hydra Logging Service",
        "redis": {
          "url": "redis://redis-cluster-ip-service:6379/0"
        }
      }
    }
```

## Also see
Consider using Frontail to view and query logs in your browser.

https://github.com/mthenw/frontail

Local installation is simple:

```shell
$ npm i frontail -g
$ frontail /Volumes/hydra-logging/hls.log
```

Just point frontail to the location of the hydra logging hls.log file.

Then access via http://localhost:9001  and trying the filter text box on the upper right!
