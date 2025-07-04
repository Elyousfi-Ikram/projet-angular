const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
