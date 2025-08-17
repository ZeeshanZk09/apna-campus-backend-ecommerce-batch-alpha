import { ACCESS_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
import jwt from 'jsonwebtoken';

// let user;

const authUser = requestHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || req?.headers('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // console.log('Access token is required');
    // return;
    throw new ApiError(401, 'Access token is required');
  }

  const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    throw new ApiError(401, 'Invalid access token');
  }

  let user = await User.findById(decodedToken._id).select('-password -refreshToken');

  console.log('user in authUser', user);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  req.user = user;
  next();
});

const authAdmin = requestHandler(async (req, _, next) => {
  const user = await req.user;

  console.log('user in authAdmin', user);
  if (!user?.isAdmin) {
    throw new ApiError(403, 'Access denied. Admins only');
  }

  next();
});

export { authUser, authAdmin };
