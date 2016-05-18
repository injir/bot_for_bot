
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var schema = new Schema({
    id   : ObjectId,
    telegram     : String,
    login : String,
    name     : String,
    phone      : String,
    email      : String,
    date      : Date
});
var Model = mongoose.model('User', schema);
module.exports =  Model;