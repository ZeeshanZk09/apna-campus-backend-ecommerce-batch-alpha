import { Router } from 'express';
import {
  userRegister,
  userLogin,
  userLogOut,
  userCurrent,
  updateUserProfile,
  deleteUser,
  getAllUsers,
} from '../controllers/user.controller.js';
import { authAdmin, authUser } from '../middlewares/auth.middleware.js';

const userRouter = Router();

// userRouter.use(authUser);
// userRouter.use(authAdmin);

userRouter.route('/register').post(userRegister);
// http://localhost:3000/api/v1/users/register
userRouter.route('/login').post(userLogin);
// http://localhost:3000/api/v1/users/login Method: POST

userRouter.route('/logout').post(authUser, userLogOut);

userRouter.route('/current-user').get(authUser, userCurrent);
userRouter.route('/update-user-profile').patch(authUser, updateUserProfile);
userRouter.route('/delete-user').delete(authUser, deleteUser);
// Admin routes

// userRouter.use(authAdmin);

// userRouter.route('/admin').get(authUser, authAdmin, (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Welcome to the admin dashboard',
//   });
// });
userRouter.route('/admin/users').get(authUser, authAdmin, getAllUsers);

export default userRouter;
