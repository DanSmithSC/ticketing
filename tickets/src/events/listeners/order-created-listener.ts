import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCreatedEvent, NotFoundError } from "@denziktickets/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";



export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated

  queueGroupName = queueGroupName

  async onMessage(data:OrderCreatedEvent['data'], msg: Message) {
    // Find the Ticket that the order is Reserving
    const ticket = await Ticket.findById(data.ticket.id)
    
    // If NO Ticket - Throw Error
    if(!ticket){
      throw new Error('Ticket not found')
    }
    
    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({orderId: data.id})
    
    // save the Ticket
    await ticket.save()

    // Publish an Event to allow services to replicate data to keep it in sync.
    await new TicketUpdatedPublisher(this .client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    })
    
    // Ack the message.
    msg.ack()
  }
}