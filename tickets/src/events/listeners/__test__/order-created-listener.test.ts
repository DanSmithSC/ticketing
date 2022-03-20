import { Message } from "node-nats-streaming";
import  mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus, Subjects } from "@denziktickets/common";
import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket";


const setup = async () => {
  // Create an instance of the listener 
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and Sae a Ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: 'adshfkj'
  })

  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'aljsdf',
    expiresAt: 'lkjalsjf',
    ticket: {
        id: ticket.id,
        price: ticket.price,
    }
  }
  
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg }
}

it('sets the userId of the Ticket', async ()=>{
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data,msg)  

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id);
})

it('Acks the message.', async ()=>{
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data,msg)  

  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async ()=>{
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data,msg)
  
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  // //@ts-ignore
  // console.log(natsWrapper.client.publish.mock.calls)

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(data.id).toEqual(ticketUpdatedData.orderId)

})

it('', async ()=>{
  
})