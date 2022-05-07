import { Schema, Model, model, Document } from 'mongoose';

import { Order, OrderStatus } from './order';

//interface that describes the properties
//that are required to create a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
}

//interface that describes the properties
//that a Ticket Model has
interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

//interface that describes the properties
//that a Ticket Document has
export interface TicketDoc extends Document {
  title: string;
  price: number;

  isReserved(): Promise<boolean>;
}

const ticketSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on

  // Run query to look at all orders. Find an order where the ticket
  // is the ticket we just found *and* the order status is *not* cancelled
  // If we find an order from that means the ticket *is* reserved
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
