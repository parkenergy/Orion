var locations = require('../controllers').Location;

module.exports = function (app) {

  /* LEASE API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL LEASES BASED ON ROLE
  app.get('/api/locations', locations.list);

  // CREATES A NEW LEASE
  app.post('/api/locations', locations.create);

  // RETURNS A SPECIFIC LEASE
  app.get('/api/locations/:id', locations.read);

  // UPDATES A SPECIFIC LEASE'S INFO
  app.post('/api/locations/:id', locations.update);

  // DELETES A SPECIFIC LEASE
  app.delete('/api/locations/:id', locations.destroy);

};
