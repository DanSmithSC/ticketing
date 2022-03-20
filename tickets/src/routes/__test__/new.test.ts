import { requireAuth } from "@denziktickets/common";
import { response } from "express";
import request from "supertest";
import { app } from "../../app"
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post Requests', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});
  expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is Signed In', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401)
  
})

it('returns a status other than 401 if the user is Singed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({})
  
  expect(response.status).not.toEqual(401) 
})

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
      title: '',
      price: 10
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
      price: 10
    })
    .expect(400)
})

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
      title: 'valid title',
      price: -10
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
      title: 'valid title'
    })
    .expect(400)
})

it('creates a ticket with valid inputs provided', async () => {
  // Check count of Records in Ticket Collection
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'akljsdflkj';

  await request(app)
  .post('/api/tickets')
  .set('Cookie',global.signin())
  .send({
    title,
    price: 20
  })
  .expect(201)

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1)
  expect(tickets[0].price).toEqual(20)
  expect(tickets[0].title).toEqual(title)
})

it('publishes an Event', async () => {
  const title = 'akljsdflkj';

  await request(app)
  .post('/api/tickets')
  .set('Cookie',global.signin())
  .send({
    title,
    price: 20
  })
  .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})