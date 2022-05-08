import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signup())
    .send({
      title: 'test',
      price: 20,
    })
    .expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).put(`/api/tickets/${id}`).send().expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'test', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({ title: 'update', price: 10 })
    .expect(401);
});

it('returns 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 10 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'testUpdate', price: -10 })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'update', price: 10 })
    .expect(202);

  const updateResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(updateResponse.body.title).toEqual('update');
  expect(updateResponse.body.price).toEqual(10);
});

it('publishes an event', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'update', price: 10 })
    .expect(202);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if ticket is reserved', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 20 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'update', price: 10 })
    .expect(400);
});
