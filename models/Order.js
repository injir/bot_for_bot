
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var schema = new Schema({
    id   : ObjectId,
    user     : String,
    description :  String,
    capability     :  String,
    budget      : String,
    contact: String,
    date      : Date,
    complite: Boolean,
    isSend: Boolean,
    stage: String
});
var Model = mongoose.model('Order', schema);
module.exports =  Model;