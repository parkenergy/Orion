function toBoolean(req, res, next) {

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
}

module.exports = function(app) {
  app.use(toBoolean);
};
