import express, { Request, Response } from 'express'
import { NotAuthorizedError, NotFoundError, requireAuth } from '@denziktickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {

  // YOU could do validation to make sure that the order in the request is a valid 
  // mongoose Order ID if you wanted to be sure.
  const order = await Order.findById(req.params.orderId).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError()
  }

  
  res.send(order);
})

export { router as showOrderRouter };