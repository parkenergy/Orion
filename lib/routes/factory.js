/* Includes
----------------------------------------------------------------------------- */
var Controller = require('../controllers');
var auth = require('../middleware/auth.js');

/* Declaration -- Exposes general API routes for all data models
----------------------------------------------------------------------------- */
var RouteFactory = function (app, collection) {

  var controller = Controller(collection);

  // RETURNS A LIST OF ELEMENTS IN THE COLLECTION BASED ON req.query DATA
  app.get('/api/' + collection, auth, controller.list);

  // CREATES A NEW ELEMENT IN THE COLLECTION BASED ON req.query AND req.obj DATA
  app.post('/api/' + collection, auth, controller.create);

  // RETURNS A SPECIFIC ELEMENT IN THE COLLECTION BASED ON req.query DATA
  app.get('/api/' + collection + '/:id', auth, controller.read);

  // UPDATES A SPECIFIC ELEMENT'S INFO BASED ON req.obj DATA
  app.post('/api/' + collection + '/:id', auth, controller.update);

  // DESTROYS A SPECIFIC ELEMENT IN THE COLLECTION
  app.delete('/api/' + collection + '/:id', auth, controller.remove);

};

/* Exports
----------------------------------------------------------------------------- */
module.exports = RouteFactory;
