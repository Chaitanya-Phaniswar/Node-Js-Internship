const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
 name: {
    type: String,
    required: true
 },
 phoneNumber: {
    type: String,
    required: true,
    unique: true
 },
 availableAmount: {
    type: Number,
    required: true
 }
});

module.exports = User = mongoose.model('user', UserSchema);