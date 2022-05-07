import { Publisher, OrderCancelledEvent, Subjects } from '@teskerti/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
