var config = {
  production: {
    mongodb: "mongodb://admin:password@ds043082.mongolab.com:43082/heroku_app37485205",
    viewsPath: "./lib/views",
    logLevel: "info",
    port: 3000
  },
  staging: {
    mongodb: "mongodb://localhost/orion-stage",
    viewsPath: "./lib/views",
    logLevel: "debug",
    port: 3000
  },
  development: {
    mongodb: "mongodb://admin:password@ds043082.mongolab.com:43082/heroku_app37485205",
    viewsPath: "./lib/views",
    logLevel: "trace",
    port: 3000
  },
  test: {
    mongodb: "mongodb://localhost/orion-test",
    viewsPath: "./lib/views",
    logLevel: "warn",
    port: 3000
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
