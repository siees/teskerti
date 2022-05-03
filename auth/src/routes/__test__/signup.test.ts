import request from 'supertest';
import { app } from '../../app';

it('returns 201 on succeful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(201);
});

it('returns 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'testtest.com', password: 'test' })
    .expect(400);
});

it('returns 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 't' })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'testtesttesttesttesttest' })
    .expect(400);
});

it('returns 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com' })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({ password: 'test' })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(400);
});

it('sets a cookie after succeful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
