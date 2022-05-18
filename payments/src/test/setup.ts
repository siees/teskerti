import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  function signup(id?: string): string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

process.env.STRIPE_KEY =
  'sk_test_51Ky4eLDtLEblKXOwZIWxWlVOWtQNa8i15MLGI17LeGd0MijNOMSegTrogbdQ37oMunp4eKKhMLrfodvN77r7OAcf002WAj8fPv';

beforeAll(async () => {
  process.env.JWT_KEY = 'abcd';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signup = (id?: string) => {
  //build a JWT payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  //Create a JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build session Object {JWT : myJWT}
  const session = { jwt: token };

  //Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return a String thats the cookie with the encoded data
  return [`session=${base64}`];
};
