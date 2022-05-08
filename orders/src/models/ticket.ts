import { Schema, Model, model, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

//interface that describes the properties
//that are required to create a new Ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
  // In case we didn't want to work with updateIfCurrentPlugin
  //version: number;
}

//interface that describes the properties
//that a Ticket Model has
interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;

  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

//interface that describes the properties
//that a Ticket Document has
export interface TicketDoc extends Document {
  title: string;
  price: number;
  version: number;

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
// Change the version key from __v to version
ticketSchema.set('versionKey', 'version');

ticketSchema.plugin(updateIfCurrentPlugin);

// In case we didn't want to work with updateIfCurrentPlugin
/*const VERSION_INCREMENT_NUMBER = 1;
ticketSchema.pre('save', function (done) {
  this.$where = {
    version: this.get('version') - VERSION_INCREMENT_NUMBER,
  };
  done();
});
*/

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({ _id: attrs.id, title: attrs.title, price: attrs.price });
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
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
