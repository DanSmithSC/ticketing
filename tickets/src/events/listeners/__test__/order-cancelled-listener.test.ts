import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from 'mongoose'
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, Subjects } from "@denziktickets/common";
import { Ticket } from "../../../models/ticket";


const setup = async () => {
  // Create an instance of the listener 
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and Sae a Ticket

  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: 'adshfkj',
  })

  ticket.set({ orderId })

  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
        id: ticket.id,
    }
  }
  
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg }
}

// good exercise to split these tests into 3 tests.
it('updates the ticket, pushlishes an event, and acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)


  //@ts-ignore
  console.log(natsWrapper.client.publish.mock.calls)

  expect(updatedTicket!.orderId).not.toBeDefined()
  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('updates the ticket, pushlishes an event, and acks the message', async () => {

})

it('updates the ticket, pushlishes an event, and acks the message', async () => {

})