/* Exports
----------------------------------------------------------------------------- */
module.exports = function (app) {

  /* Custom Routes
  --------------------------------------------------------------------------- */
  require('./auth')(app);
  require('./support')(app);

  /* Generalized CRUD REST API routes constructed via factory.js
  --------------------------------------------------------------------------- */
  require('./factory') (app, "applicationtypes");
  require('./factory') (app, "areas");
  //require('./factory') (app, "compressors");
  require('./factory') (app, "counties");
  require('./factory') (app, "customers");
  //require('./factory') (app, "engines");
  //require('./factory') (app, "locations");
  require('./factory') (app, "inventorytransfers");
  require('./factory') (app, "parts");
  require('./factory') (app, "transfers");
  require('./factory') (app, "states");
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
