import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose'
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided Ticket ID does not exist.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: "auto test title",
      price: 20
    })
    .expect(404)
})

it('returns a 401 if the user is not Authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "auto test title",
      price: 20
    })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket.', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: "blah title",
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: 'new random title',
      price: 1000
    })
    .expect(401)  
})

it('returns a 400 if the user provides an invalid title or price.', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "blah title",
      price: 20
    })
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'yaya title',
      price: -10
    })
    .expect(400);  
})

it('updates the ticket provided valid inputs.', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "blah title",
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: "Blah Titled Edited!",
      price: 1020
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('Blah Titled Edited!');
  expect(ticketResponse.body.price).toEqual(1020);
})

it('publishes an Event', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "blah title",
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: "Blah Titled Edited!",
      price: 1020
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if a ticket is reserved', async () => {
  // Get User Cookie 
  const cookie = global.signin()

  // Make a request to create a ticket as the user
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "blah title",
      price: 20
    });
  
  // Find the Ticket  
  const ticket = await Ticket.findById(response.body.id) 
  
  // Set the Ticket's Order Id property
  ticket!.set({
    orderId: new mongoose.Types.ObjectId().toHexString()
  })
  
  // Save the ticket again now with the new OrderId on it.
  await ticket!.save()

  // Attempt to update the ticket with the order ID on it and expect it to fail with a bad Request.
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: "Blah Titled Edited!",
      price: 1020
    })
    .expect(400);
})