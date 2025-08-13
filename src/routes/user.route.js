import { Router } from 'express';
import { userRegister, userLogin } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middlware.js';

const userRouter = Router();

// userRouter.use(authMiddleware);

userRouter.route('/register').post(userRegister);
// http://localhost:3000/api/v1/users/register
userRouter.route('/login').post(userLogin);
// http://localhost:3000/api/v1/users/login Method: POST

userRouter.route('/logout').post(authMiddleware, userLogOut);

userRouter.route('/current-user').get();
export default userRouter;
