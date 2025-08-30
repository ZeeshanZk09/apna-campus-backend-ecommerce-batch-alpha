import { ACCESS_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import jwt from 'jsonwebtoken';

// let user;

const authUser = requestHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers['authorization']?.replace('Bearer ', '') || null;

    if (!token) {
      console.log('Access token is required');
      throw new ApiError(401, 'Access token is required');
    }

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, 'Invalid access token');
    }

    let user = await User.findById(decodedToken._id, {
      _id: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      email: 1,
      isAdmin: 1,
      password: 1,
      createdAt: 1,
      updatedAt: 1,
    }).lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid access token');
    }
    error.message ? new ApiError(error.statusCode, error.message) : error;
  }
});

const authAdmin = requestHandler(async (req, _, next) => {
  try {
    const user = await req.user;

    if (!user) {
      throw new ApiError(401, 'User not authenticated');
    }

    console.log('user in authAdmin', user);
    if (!user.isAdmin) {
      throw new ApiError(403, 'Access denied. Admins only');
    }

    next();
  } catch (error) {
    throw new (error.message ? new ApiError(error.statusCode, error.message) : error)();
  }
});

export { authUser, authAdmin };
