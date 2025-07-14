import { User } from '../models/user.model.js';
import requestHandler from '../utilities/requestHandler.js';

const userRegister = requestHandler(async (req, res, next, err) => {
  // register krny ke lia kia kia chahai or jo chahia wo aay ga kahan se
  //  username, email, password
  const { username, email, password } = req.body;
  if (!username || !email) {
    res.send('Enter a valid username or email');
  }

  if (!password) {
    res.send('Please enter a valid password');
  }

  const createdUser = await User.create({
    username,
    email,
    password,
  });

  if (!createdUser) {
    res.send('Internal Server Error').status(501);
  }

  return res.status(201).json(createdUser);
});

export { userRegister };
