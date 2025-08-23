import { ACCESS_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import jwt from 'jsonwebtoken';

// let user;

const authUser = requestHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req?.headers('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Access token is required');
      return next(ApiError(401, 'Access token is required'));
    }

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return next(ApiError(401, 'Invalid access token'));
    }

    let user = await User.findById(decodedToken._id, {
      _id: 1,
      username: 1,
      email: 1,
      isAdmin: 1,
      password: 1,
      createdAt: 1,
      updatedAt: 1,
    });

    console.log('user in authUser', user);

    if (!user) {
      return next(ApiError(404, 'User not found'));
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid access token'));
    }
    next(error);
  }
});

const authAdmin = requestHandler(async (req, _, next) => {
  try {
    const user = await req.user;

    console.log('user in authAdmin', user);
    if (!user.isAdmin) {
      return next(ApiError(403, 'Access denied. Admins only'));
    }

    next();
  } catch (error) {
    next(error.message ? new ApiError(error.statusCode, error.message) : error);
  }
});

export { authUser, authAdmin };
