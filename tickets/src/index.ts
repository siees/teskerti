import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT key must be defined');
    }

    await mongoose.connect(
      'mongodb://tickets-mongo-clusterip-srv:27017/tickets'
    );

    console.log('Connected to MongoDb');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!');
  });
};

start();
