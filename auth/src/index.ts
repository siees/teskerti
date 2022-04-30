import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT key must be defined');
    }

    await mongoose.connect('mongodb://auth-mongo-clusterip-srv:27017/auth');

    console.log('Connected to MongoDb');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!');
  });
};

start();
