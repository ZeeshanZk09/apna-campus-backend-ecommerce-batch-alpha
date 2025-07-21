import { Router } from 'express';
import { userRegister, userLogin } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.route('/register').post(userRegister);
// http://localhost:3000/api/v1/users/register
userRouter.route('/login').post(userLogin);
// http://localhost:3000/api/v1/users/login Method: POST
export default userRouter;
