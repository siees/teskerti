import express from 'express';
import 'express-async-errors';
import { errorHandler, NotFoundError } from '@teskerti/common';

const app = express();
app.set('trust proxy', true);
app.use(express.json());

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
