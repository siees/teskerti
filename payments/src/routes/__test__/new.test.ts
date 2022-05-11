import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('has a route handler listening to /api/payments for post request', async () => {
  const response = await request(app).post('/api/payments').send({});

  expect(response.status).not.toEqual(404);
});

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'token',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 50,
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'token',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 50,
    version: 0,
    status: OrderStatus.Cancelled,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(order.userId))
    .send({
      token: 'token',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 50,
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(order.userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions!.source).toEqual('tok_visa');
  expect(chargeOptions!.amount).toEqual(order.price * 100);
  expect(chargeOptions!.currency).toEqual('usd');
});
