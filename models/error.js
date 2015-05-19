var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;

var ErrorSchema = new mongoose.Schema({

  data: { type: Mixed }

});

module.exports = mongoose.model('Errors', ErrorSchema);
