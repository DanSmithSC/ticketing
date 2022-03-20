import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';
  
  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    //Business Logic entered in here.
    console.log('Event Data!', data)
    
    console.log(data.id)
    console.log(data.title)
    console.log(data.price)
    //Acknowledge the message if everything goes right.
    msg.ack();
  }
}