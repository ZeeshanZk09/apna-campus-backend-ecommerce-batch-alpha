import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
import bcrypt from 'bcryptjs';

const userRegister = requestHandler(async (req, res, next, err) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
  if (!username || !email || !password) {
    throw new ApiError(400, 'All fields are required.');
  }

  // check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const encodedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: encodedPassword,
  });

  if (!user) {
    throw new ApiError(501, 'Internal Server Error');
  }

  const createdUser = await User.findById(user._id).select('-password');

  return res.status(201).json(new ApiResponse(201, createdUser, 'User created successfully'));
});

const userLogin = requestHandler(async (req, res, next, err) => {
  // required fields to validate
  const { username, email, password } = req.body;
  // validate if fields are empty
  if ((!username && !email) || !password) {
    throw new ApiError(400, 'All fields are required.');
  }
  // find the user in database (email || username)
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  // check the password if valid or not
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw new ApiError(401, 'Please enter a valid password.');
  }

  const loggedInUser = await User.findById(user._id).select('-password');

  if (!loggedInUser) {
    throw new ApiError(404, 'User not found');
  }
  // return the user | document
  return res.status(200).json(new ApiResponse(200, loggedInUser, 'User logged In successfully'));
});

export { userRegister, userLogin };
