import { Listener, OrderCreatedEvent, Subjects } from '@teskerti/common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('waiting for this many seconds', delay * 1000);

    await expirationQueue.add({ orderId: data.id }, { delay });

    // ack the message
    msg.ack();
  }
}
