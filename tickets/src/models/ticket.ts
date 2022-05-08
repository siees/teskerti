import { Schema, Model, model, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//interface that describes the properties
//that are required to create a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

//interface that describes the properties
//that a Ticket Model has
interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

//interface that describes the properties
//that a Ticket Document has
interface TicketDoc extends Document {
  title: string;
  price: number;
  userId: string;
  version: number;
}

const ticketSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
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

// Change version key from __v to version
ticketSchema.set('versionKey', 'version');

ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
