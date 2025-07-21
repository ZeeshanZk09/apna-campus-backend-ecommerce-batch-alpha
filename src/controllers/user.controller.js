import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/ApiError.js';
import requestHandler from '../utilities/requestHandler.js';
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
  // logic to login
  // required fields: email, password, username
});

export { userRegister, userLogin };
