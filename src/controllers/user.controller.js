import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
// create
// update
// updateById
//
const userRegister = requestHandler(async (req, res, next, err) => {
  // register krny ke lia kia kia chahai or jo chahia wo aay ga kahan se
  //  username, email, password
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, 'Enter a valid username or email');
  }

  // check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }
  // check if password is valid
  if (!password) {
    throw new ApiError(400, 'Please enter a valid password');
  }

  const createdUser = await User.create({
    username,
    email,
    password,
  });

  if (!createdUser) {
    throw new ApiError(501, 'Internal Server Error');
  }

  return res.status(201).json(new ApiResponse(201, createdUser, 'User created successfully'));
});

const userLogin = requestHandler(async (req, res, next, err) => {
  // required fields to validate
  const { username, email, password } = req.body;
  // validate if fields are empty
  if (!username && !email) {
    throw new ApiError(400, 'Please enter a valid email or username');
  }
  // find the user in database (email || username)
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // check the password if valid or not
  if (password) {
    if (password != user.password) {
      throw new ApiError(400, 'Please enter a valid password');
    }
  }
  // return the user | document
  return res.status(200).json(new ApiResponse(200, user, 'User logged In successfully'));
});

export { userRegister, userLogin };
