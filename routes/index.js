module.exports = function (app) {

  require('./factory') (app, "customers");
  // require('./location')(app);
  // require('./part')(app);
  // require('./unit')(app);
  // require('./user')(app);
  // require('./vendor')(app);
  // require('./workorder')(app);

  app.get('/', function (req, res) {
    var model = { appName: "Orion", title: "Orion" };
    res.render('index', model);
  });

};
