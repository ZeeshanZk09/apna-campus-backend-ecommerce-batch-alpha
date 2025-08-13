import mongoose from 'mongoose';
import { User } from '../models/user.model';

export default async function generateToken(userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let accessToken, refreshToken;

    try {
      accessToken = await user.generateAccessToken();
      refreshToken = await user.generateRefreshToken();
    } catch (error) {
      throw new Error('Error generating tokens: ' + error?.message);
    }

    if (!accessToken || !refreshToken) {
      throw new Error('Failed to generate tokens');
    }

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error in generateToken:', error);
    throw new ApiError(500, error.message || 'Failed to generate tokens');
  }
}
