import { Router } from 'express';
import { userRegister } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.route('/').get((req, res, next) => {
  res.send('users');
});
userRouter.route('/register').post(userRegister);

export default userRouter;
