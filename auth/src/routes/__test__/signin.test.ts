import request from 'supertest';
import { app } from '../../app';

it('fails when email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(400);
});

it('fails when incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'test1' })
    .expect(400);
});

it('returns 200 on succeful signin with a cookie', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'test' })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
