import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create an Instance of a Ticket
  const ticket = Ticket.build({
    title: 'Concert Ticket',
    price: 5,
    userId: '1234'
  })
  // Save a ticket to the Database
  await ticket.save()
  // Fetch the ticket Twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)
  
  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 })
  // Save the first fetched ticket.
  await firstInstance!.save()

  // Save the second fetched ticket and expect an error.
  try{
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  
  throw new Error('should not reach this point.')
})

it('increments the version # on multiple saves.', async () => {
  // Create an Instance of a Ticket
  const ticket = Ticket.build({
    title: 'Concert Ticket',
    price: 20,
    userId: '1234'
  })
  // Save a ticket to the Database
  await ticket.save()
  
  expect(ticket.version).toEqual(0)
  
  await ticket.save()

  expect(ticket.version).toEqual (1)

  await ticket.save()

  expect(ticket.version).toEqual (2)
  
})