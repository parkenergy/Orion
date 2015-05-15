var vendors = require('../controllers').Vendor;

module.exports = function (app) {

  /* VENDOR API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL VENDORS BASED ON ROLE
  app.get('/api/vendors', vendors.list);

  // CREATES A NEW VENDOR
  app.post('/api/vendors', vendors.create);

  // RETURNS A SPECIFIC VENDOR
  app.get('/api/vendors/:id', vendors.read);

  // UPDATES A SPECIFIC VENDOR'S INFO
  app.post('/api/vendors/:id', vendors.update);

  // DELETES A SPECIFIC VENDOR
  app.delete('/api/vendors/:id', vendors.destroy);

};
