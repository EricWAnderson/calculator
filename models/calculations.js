var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CalculationsSchema = new Schema({
    results: Array
});

var Calculations = mongoose.model('Calculations', CalculationsSchema);

module.exports = Calculations;
