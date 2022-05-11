import { Publisher, Subjects, PaymentCreatedEvent } from '@teskerti/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
