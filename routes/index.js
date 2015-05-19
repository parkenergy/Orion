/* Exports
----------------------------------------------------------------------------- */
module.exports = function (app) {

  /* Custom Routes
  --------------------------------------------------------------------------- */
  require('./auth')(app);

  /* Generalized CRUD REST API routes constructed via factory.js
  --------------------------------------------------------------------------- */
  require('./factory') (app, "customers");
  require('./factory') (app, "locations");
  require('./factory') (app, "parts");
  require('./factory') (app, "units");
  require('./factory') (app, "users");
  require('./factory') (app, "vendors");
  require('./factory') (app, "workorders");

  /* Index Route
  --------------------------------------------------------------------------- */
  app.get('/', function (req, res) {
    var model = { appName: "Orion", title: "Orion" };
    res.render('index', model);
  });

};
