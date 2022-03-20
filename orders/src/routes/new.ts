import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import { NotFoundError, requireAuth, validateRequest, OrderStatus, BadRequestError } from '@denziktickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// COULD extract it into an environment variable or...
// put it into a DB and have it be editable in an admin panel
const EXPIRATION_WINDOW_SECONDS =  1 * 60;

router.post(
  '/api/orders', 
  requireAuth, [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string)=> mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
], 
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the Ticket the user is Trying to order in the DB
    const ticket = await Ticket.findById(ticketId);

    if(!ticket){
      throw new NotFoundError();
    }

    // Make sure the ticket is not already reserved.
    
    const isReserved = await ticket.isReserved()
    
    if(isReserved) {
      throw new BadRequestError('Ticket is Already Reserved')
    }

    // Calculate an expiration for the Order. (15 min /time duration)
    const expiration = new Date();

    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS )

    // Build the Order and save it to the DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    })

    await order.save();

    // Publish/Emit an Event that an Order has been created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    })

    res.status(201).send(order);
  }
)

export { router as newOrderRouter };