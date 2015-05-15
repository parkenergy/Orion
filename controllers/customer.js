

module.exports = {

  list: function (req, res, next) {

    if (req.query) {

      query.exec(function (err, data) {
        if (err) { return next(err); }
        return res.send(data);
      });

    }

    
  },
  create: function (req, res, next) {},
  read: function (req, res, next) {},
  update: function (req, res, next) {},
  destroy: function (req, res, next) {}
}
