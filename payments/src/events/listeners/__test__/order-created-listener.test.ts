import { OrderCreatedEvent, OrderStatus } from '@teskerti/common';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  // Create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: OrderCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'expiresAt',
    ticket: {
      price: 10,
      id: 'ticket.id',
    },
    status: OrderStatus.Created,
    userId: 'user',
  };

  // Create a fake message Object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
