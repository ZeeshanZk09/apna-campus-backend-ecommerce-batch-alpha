import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
// import bcrypt from 'bcryptjs';
import generateToken from '../utilities/generateToken.js';
import { NODE_ENV } from '../constants.js';
import mongoose from 'mongoose';

const userRegister = requestHandler(async (req, res, next, err) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    if (!username || !email || !password) {
      return next(new ApiError(400, 'All fields are required.'));
    }

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(new ApiError(400, 'User already exists'));
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
      return next(new ApiError(501, 'Internal Server Error'));
    }

    const { accessToken, refreshToken } = await generateToken(user._id);

    if (!accessToken || !refreshToken) {
      return next(new ApiError(500, 'Error generating tokens'));
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
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error.message ? new ApiError(error.statusCode, error.message) : error);
    }
    console.error('Error in user registration:', error);
    return next(new ApiError(500, 'Internal Server Error during user registration'));
  }
});

const userLogin = requestHandler(async (req, res, next, err) => {
  try {
    // required fields to validate
    const { username, email, password } = req.body;
    // validate if fields are empty
    if ((!username && !email) || !password) {
      return next(new ApiError(400, 'All fields are required.'));
    }
    // find the user in database (email || username)
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    // if user not found
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    const { accessToken, refreshToken } = await generateToken(user._id);
    // set the cookies

    if (!accessToken || !refreshToken) {
      return next(new ApiError(500, 'Error generating tokens'));
    }

    // check the password if valid or not
    const comparePassword = await user.comparePassword(password);
    // const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return next(new ApiError(401, 'Please enter a valid password.'));
    }

    const loggedInUser = await User.findById(user._id).select('-password');

    if (!loggedInUser) {
      return next(new ApiError(404, 'User not found'));
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
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error.message ? new ApiError(error.statusCode, error.message) : error);
    }
    console.error('Error in user login:', error);
    return next(new ApiError(500, 'Internal Server Error during user login'));
  }
});

const userLogOut = requestHandler(async (req, res, next, err) => {
  try {
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
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error.message ? new ApiError(error.statusCode, error.message) : error);
    }
    console.error('Error in user logout:', error);
    return next(new ApiError(500, 'Internal Server Error during user logout'));
  }
});

const userCurrent = requestHandler(async (req, res, next) => {
  try {
    const user = await req.user;

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    return res.status(200).json(new ApiResponse(200, user, 'Current user fetched successfully'));
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error.message ? new ApiError(error.statusCode, error.message) : error);
    }
    console.error('Error fetching current user:', error);
    return next(new ApiError(500, 'Internal Server Error while fetching current user'));
  }
});

const updateUserProfile = requestHandler(async (req, res, next) => {
  try {
    const user = await req.user;

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    const { username = '', email = '', password = '' } = req.body;

    if (username) user.username = username || user.username;
    if (email) user.email = email || user.email;
    if (password) user.password = password || user.password;

    const updatedUser = await user.save();

    if (!updatedUser) {
      return next(new ApiError(500, 'Error updating user profile'));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedUser.toObject(),
          password: undefined,
        },
        'User profile updated successfully'
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error.message ? new ApiError(error.statusCode, error.message) : error);
    }
    console.error('Error updating user profile:', error);
    return next(new ApiError(500, 'Internal Server Error while updating user profile'));
  }
});

// Admin controllers

const getAllUsers = requestHandler(async (req, res, next) => {
  try {
    // define query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search; // id, username, email, isAdmin, createdAt;

    // // Get total number of users

    const query = {};
    console.log(query);

    if (search) {
      if (search.length < 3) {
        return next(new ApiError(400, 'Search term must be at least 3 characters long'));
      }

      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];

      // ObjectId search
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: search });
      }

      // Boolean search
      if (search.toLowerCase() === 'true' || search.toLowerCase() === 'admin') {
        query.$or.push({ isAdmin: true });
      } else if (search.toLowerCase() === 'false' || search.toLowerCase() === 'user') {
        query.$or.push({ isAdmin: false });
      }

      // Date search - try to parse as date
      const searchDate = new Date(search);
      if (!isNaN(searchDate)) {
        query.$or.push({
          createdAt: {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            $lte: new Date(searchDate.setHours(23, 59, 59, 999)),
          },
        });
      }
    }

    const users = await User.find(query, {
      _id: 1,
      username: 1,
      email: 1,
      isAdmin: 1,
      createdAt: 1,
      updatedAt: 1,
    })
      .sort({ createdAt: -1 }) // desc
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    if (!users || users.length === 0) {
      return next(new ApiError(404, 'No users found'));
    }
    const total = await User.countDocuments(query);
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
  } catch (error) {
    // detailed error handling
    if (error instanceof ApiError) {
      return next(error.message ? new ApiError(error.statusCode, error.message) : error);
    }
    console.error('Error fetching users:', error);
    return next(new ApiError(500, 'Internal Server Error while fetching users'));
  }
});

//

export { userRegister, userLogin, userLogOut, userCurrent, getAllUsers, updateUserProfile };
