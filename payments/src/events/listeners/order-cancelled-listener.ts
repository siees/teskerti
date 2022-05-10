import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@teskerti/common';
import { Message } from 'node-nats-streaming';

import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id, version } = data;

    const order = await Order.findByEvent({ id, version });
    if (!order) {
      throw new Error('Order not found!');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
