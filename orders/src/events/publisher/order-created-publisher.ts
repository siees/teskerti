import { Publisher, OrderCreatedEvent, Subjects } from '@teskerti/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
