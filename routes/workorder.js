var workorders = require('../controllers').WorkOrder;

module.exports = function (app) {

  /* WORKORDER API
  --------------------------------------------------------------------------- */

  // RETURNS A LIST OF ALL WORKORDERS BASED ON ROLE
  app.get('/api/workorders', workorders.list);

  // CREATES A NEW WORKORDER
  app.post('/api/workorders', workorders.create);

  // RETURNS A SPECIFIC WORKORDER
  app.get('/api/workorders/:id', workorders.read);

  // UPDATES A SPECIFIC WORKORDER'S INFO
  app.post('/api/workorders/:id', workorders.update);

  // DELETES A SPECIFIC WORKORDER
  app.delete('/api/workorders/:id', workorders.destroy);

};
