var customers = require('../controllers').Customer;

module.exports = function (app) {

  /* CUSTOMER API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL CUSTOMERS BASED ON ROLE
  app.get('/api/customers', customers.list);

  // CREATES A NEW CUSTOMER
  app.post('/api/customers', customers.create);

  // RETURNS A SPECIFIC CUSTOMER
  app.get('/api/customers/:id', customers.read);

  // UPDATES A SPECIFIC CUSTOMER'S INFO
  app.post('/api/customers/:id', customers.update);

  // DELETES A SPECIFIC CUSTOMER
  app.delete('/api/customers/:id', customers.destroy);

};
