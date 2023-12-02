const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
 sender: {
    type: String, 
    required: true
},
 reciever:  { 
    type: String, 
    required: true 
},
 amount: { 
    type: Number, 
    required: true },
 date: { 
    type: String,
    required: true 
 }
});

module.exports = mongoose.model('Transaction', transactionSchema);