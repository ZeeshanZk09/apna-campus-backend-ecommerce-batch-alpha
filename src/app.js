import express from 'express';
import userRouter from './routes/user.route.js';
import { API_ROUTE } from './constants.js';

const app = express();

app.use(`${API_ROUTE}/users`, userRouter);

export { app };
