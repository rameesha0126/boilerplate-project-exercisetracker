const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
}); 

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  description: { type: String, required: true }, 
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}); 

const User = mongoose.model('User', userSchema); 
const Exercise = mongoose.model('Exercise', exerciseSchema); 

module.exports = { User, Exercise };