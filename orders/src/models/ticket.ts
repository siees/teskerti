import { Schema, Model, model, Document } from 'mongoose';

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

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
