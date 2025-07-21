import mongoose, { Schema } from 'mongoose';
// schema modeling | data modeling
// mongodb > client > database > collection > document
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
});
// users
export const User = mongoose.model('User', userSchema);
