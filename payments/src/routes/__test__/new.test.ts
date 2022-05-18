import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

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
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
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

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
