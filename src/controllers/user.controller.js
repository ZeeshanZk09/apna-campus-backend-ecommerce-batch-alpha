import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
// import bcrypt from 'bcryptjs';
import generateToken from '../utilities/generateToken.js';
import { NODE_ENV } from '../constants.js';

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

  // const salt = await bcrypt.genSalt(10);
  // const encodedPassword = await bcrypt.hash(password, salt);

  let user = await User.create({
    username,
    email,
    password,
    // password: encodedPassword,
  });

  if (!user) {
    throw new ApiError(501, 'Internal Server Error');
  }

  const { accessToken, refreshToken } = await generateToken(user._id);

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, 'Error generating tokens');
  }

  const createdUser = await User.findById(user._id).select('-password');

  return res
    .status(201)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(201, createdUser, 'User created successfully'));
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

  // if user not found
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { accessToken, refreshToken } = await generateToken(user._id);
  // set the cookies

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, 'Error generating tokens');
  }

  // check the password if valid or not
  const comparePassword = await user.comparePassword(password);
  // const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw new ApiError(401, 'Please enter a valid password.');
  }

  const loggedInUser = await User.findById(user._id).select('-password');

  if (!loggedInUser) {
    throw new ApiError(404, 'User not found');
  }

  // return the user | document
  return res
    .status(200)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, loggedInUser, 'User logged In successfully'));
});

const userLogOut = requestHandler(async (req, res, next, err) => {
  // clear the cookies
  return res
    .status(200)
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .clearCookie('refreshToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .json(new ApiResponse(200, null, 'User logged out successfully'));
});

const userCurrent = requestHandler(async (req, res, next) => {
  const user = await req.user;

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, user, 'Current user fetched successfully'));
});

// Admin controllers

const getAllUsers = requestHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { password: 0, refreshToken: 0 })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  if (!users || users.length === 0) {
    throw new ApiError(404, 'No users found');
  }
  return res.json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total, // total records
          page, // current page
          limit, // records per page
          totalPages: Math.ceil(total / limit), // total pages
        },
      },
      'All users fetched successfully'
    )
  );
});

export { userRegister, userLogin, userLogOut, userCurrent, getAllUsers };
