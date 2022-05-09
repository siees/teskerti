import { Publisher, ExpirationCompleteEvent, Subjects } from '@teskerti/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
