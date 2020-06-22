import express from 'express';
import userRouter from './user';

var app = express();

app.use('/user', userRouter);

export default app;