import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
  BadRequestError,
} from '@teskerti/common';

import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').trim().not().isEmpty().withMessage('Title must be supplied!'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0!'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    //Ticket not found
    if (!ticket) {
      throw new NotFoundError();
    }
    //Ticket is already reserved
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }
    //User does not own the ticket
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({ title: title, price: price });
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(202).send(ticket);
  }
);

export { router as updateTicketRouter };
