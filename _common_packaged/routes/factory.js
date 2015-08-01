/* Includes
----------------------------------------------------------------------------- */
var Controller = require('../controllers');

/* Declaration -- Exposes general API routes for all data models
----------------------------------------------------------------------------- */
var RouteFactory = function (app, collection) {

  var controller = Controller(collection);

  // RETURNS A LIST OF ELEMENTS IN THE COLLECTION BASED ON req.query DATA
  app.get('/api/' + collection, controller.list);

  // CREATES A NEW ELEMENT IN THE COLLECTION BASED ON req.query AND req.obj DATA
  app.post('/api/' + collection, controller.create);

  // RETURNS A SPECIFIC ELEMENT IN THE COLLECTION BASED ON req.query DATA
  app.get('/api/' + collection + '/:id', controller.read);

  // UPDATES A SPECIFIC ELEMENT'S INFO BASED ON req.obj DATA
  app.post('/api/' + collection + '/:id', controller.update);

  // DESTROYS A SPECIFIC ELEMENT IN THE COLLECTION
  app.delete('/api/' + collection + '/:id', controller.remove);

};

/* Exports
----------------------------------------------------------------------------- */
module.exports = RouteFactory;
