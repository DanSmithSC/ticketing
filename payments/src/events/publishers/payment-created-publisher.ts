import { Subjects, Publisher, PaymentCreatedEvent } from "@denziktickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}