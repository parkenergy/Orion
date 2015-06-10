
var dbConnectionUrls = {
  production: 'mongodb://admin:password@ds043082.mongolab.com:43082/heroku_app37485205',
  staging: 'mongodb://admin:password@ds035270.mongolab.com:35270/heroku_app37313086',
  client: 'mongodb://localhost/orion-client',
  development: 'mongodb://localhost/orion-dev',
  test: 'mongodb://localhost/orion-test'
}

var globals = {
  dbConnectionUrls: dbConnectionUrls
};

module.exports = globals;
