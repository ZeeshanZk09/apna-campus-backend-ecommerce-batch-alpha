import express from 'express';
import { API_ROUTE } from './constants.js';
import cookieParser from 'cookie-parser';
const app = express();

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

import userRouter from './routes/user.route.js';

app.use(`${API_ROUTE}/user`, userRouter);
app.get('/', (req, res, next) => {
  res.send('Welcome to backend');
});

export { app };
