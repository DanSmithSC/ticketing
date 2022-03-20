import { Publisher, Subjects, TicketCreatedEvent } from "@denziktickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated 
}