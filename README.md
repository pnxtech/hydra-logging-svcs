# hydra-logging-svcs
Hydra Logging Service

A logging service for Hydra-enabled services which use the [hydra-plugin-hls](https://github.com/cjus/hydra-plugin-hls) module.

## Logging to terminal

By default, hls logs to the terminal.  You can modify this behavior by updating the config/config.json logger.logToConsole entry to false.

```
  "logger": {
    "logToConsole": false
  },
```

## Logging to database

Hls logs does not log to a database by default.  It can log to a Mongodb database instance, either locally or remotely. You can modify this behavior by updating the config/config.json logger.logToDB entry to true and specifying a Mongo connection string.

```
  "logger": {
    "logToDB": true,
    "mongodb": {
      "connectionString": "mongodb://host:27017/hls"
    }
  },
```

