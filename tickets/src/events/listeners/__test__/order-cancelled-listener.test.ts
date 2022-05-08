import { OrderCancelledEvent, OrderStatus } from '@teskerti/common';
import mongoose from 'mongoose';

import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create, set orderId and save a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 10,
    userId: 'user',
  });
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // Create a fake message Object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, orderId, data, msg };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, ticket, orderId, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  // Expect update event
  expect(updatedTicket!.orderId).not.toBeDefined();
  // Expect acks message
  expect(msg.ack).toHaveBeenCalled();
  // Expect publishes an event
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
