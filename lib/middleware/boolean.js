'use strict';
const toBoolean = (req, res, next) => {
  let param;
  for(param in req.query) {
    if(req.query.hasOwnProperty(param)) {
      if (req.query[param] === 'true') {
        req.query[param] = true;
      }
      else if (req.query[param] === 'false') {
        req.query[param] = false
      }
    }
  }
  next();
};

module.exports = app => {
  app.use(toBoolean);
};
