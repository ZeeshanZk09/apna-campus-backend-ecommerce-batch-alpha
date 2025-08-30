import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constants.js';
import jwt from 'jsonwebtoken';

// schema modeling | data modeling
// mongodb > client > database > collection > document
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: [true, 'username already exists.'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email already exists.'],
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    console.log(error);
    throw new Error('Error while hashing password');
  }
});

userSchema.methods.comparePassword = async function (password) {
  const comparePassword = await bcrypt.compare(password, this.password);
  return comparePassword;
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ id: this._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
};
export const User = mongoose.model('User', userSchema);
