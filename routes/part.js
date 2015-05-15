var parts = require('../controllers').Part;

module.exports = function (app) {

  /* LEASE API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL LEASES BASED ON ROLE
  app.get('/api/parts', parts.list);

  // CREATES A NEW LEASE
  app.post('/api/parts', parts.create);

  // RETURNS A SPECIFIC LEASE
  app.get('/api/parts/:id', parts.read);

  // UPDATES A SPECIFIC LEASE'S INFO
  app.post('/api/parts/:id', parts.update);

  // DELETES A SPECIFIC LEASE
  app.delete('/api/parts/:id', parts.destroy);

};
