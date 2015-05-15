module.exports = function (app) {
  require('./auth')(app);
  require('./customer')(app);
  require('./location')(app);
  require('./part')(app);
  require('./unit')(app);
  require('./user')(app);
  require('./vendor')(app);
  require('./workorder')(app);

  app.get('/', function (req, res) {
    var model = { appName: "Orion", title: "Orion" };
    res.render('index', model);
  });

};
