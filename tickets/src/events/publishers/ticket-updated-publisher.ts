import { Publisher, Subjects, TicketUpdatedEvent } from "@denziktickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated
}