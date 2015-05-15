var users = require('../controllers').User;

module.exports = function (app) {

  /* USER API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL USERS BASED ON ROLE
  app.get('/api/users', users.list);

  // CREATES A NEW USER
  app.post('/api/users', users.create);

  // RETURNS A SPECIFIC USER
  app.get('/api/users/:id', users.read);

  // UPDATES A SPECIFIC USER'S INFO
  app.post('/api/users/:id', users.update);

  // DELETES A SPECIFIC USER
	app.delete('/api/users/:id', users.destroy);

};
