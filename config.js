"use strict";
const BunyanSlack = require("bunyan-slack");

const config = {
    production: {
        it_service: "Inventorytransferservice.us-west-2.elasticbeanstalk.com",
        mongodb: "mongodb://172.31.8.0:27017/orion",
        viewsPath: "./lib/views",
        logging: {
            name: "Orion",
            streams: [
                {
                   stream: process.stdout,
                    //path: 'orion.log',
                    level: "info"
                },
                {
                    stream: new BunyanSlack({
                        webhook_url:
                            "https://hooks.slack.com/services/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",
                        channel: "alerts",
                        username: "Orion"
                    }),
                    level: "error"
                }
            ]
        },
        port: 3000
    },
    staging: {
        it_service: "http://localhost:8888",
        mongodb: "mongodb://localhost/orion-stage",
        viewsPath: "./lib/views",
        logging: {
            name: "Orion",
            streams: [
                {
                    stream: process.stdout,
                    level: "debug"
                }
            ]
        },
        port: 3000
    },
    development: {
        it_service: "http://localhost:8888",
        mongodb: "mongodb://localhost:27017/orion-dev",
        viewsPath: "./lib/views",
        logging: {
            name: "Orion",
            streams: [
                {
                    stream: process.stdout,
                    level: "trace"
                }
            ]
        },
        port: 3000
    },
    test: {
        mongodb: "mongodb://localhost/orion-test",
        viewsPath: "./lib/views",
        logging: {
            name: "Orion",
            streams: [
                {
                    stream: process.stdout,
                    level: "warn"
                }
            ]
        },
        port: 3000
    }
};

module.exports = config[process.env.NODE_ENV || "development"];
