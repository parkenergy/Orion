var units = require('../controllers').Unit;

module.exports = function (app) {

  /* UNIT API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL UNITS BASED ON ROLE
  app.get('/api/units', units.list);

  // CREATES A NEW UNIT
  app.post('/api/units', units.create);

  // RETURNS A SPECIFIC UNIT
  app.get('/api/units/:id', units.read);

  // UPDATES A SPECIFIC UNIT'S INFO
  app.post('/api/units/:id', units.update);

  // DELETES A SPECIFIC UNIT
  app.delete('/api/units/:id', units.destroy);

};
