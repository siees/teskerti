import { Schema, Model, model, Document } from 'mongoose';
import { OrderStatus } from '@teskerti/common';

import { TicketDoc } from './ticket';

export { OrderStatus };

//interface that describes the properties
//that are required to create a new Order
interface OrderAttrs {
  status: OrderStatus;
  ticket: TicketDoc;
  userId: string;
  expiresAt: Date;
}

//interface that describes the properties
//that a Order Model has
interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

//interface that describes the properties
//that a Order Document has
interface OrderDoc extends Document {
  status: OrderStatus;
  ticket: TicketDoc;
  userId: string;
  expiresAt: Date;
}

const orderSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      index: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    userId: { type: String, required: true },
    expiresAt: { type: Schema.Types.Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
