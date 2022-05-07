import { Publisher, Subjects, TicketCreatedEvent } from '@teskerti/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
