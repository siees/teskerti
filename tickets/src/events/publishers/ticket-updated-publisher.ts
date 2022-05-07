import { Publisher, Subjects, TicketUpdatedEvent } from '@teskerti/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
