import { Schema, Model, model, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@teskerti/common';

export { OrderStatus };

//interface that describes the properties
//that are required to create a new Order
interface OrderAttrs {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

//interface that describes the properties
//that a Order Model has
interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;

  findByEvent(event: { id: string; version: number }): Promise<OrderDoc | null>;
}

//interface that describes the properties
//that a Order Document has
interface OrderDoc extends Document {
  status: OrderStatus;
  userId: string;
  version: number;
  price: number;
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
    userId: { type: String, required: true },
    price: { type: Number, required: true },
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
orderSchema.set('versionKey', 'version');

orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    versio: attrs.version,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price,
  });
};

orderSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Order.findOne({ _id: event.id, version: event.version - 1 });
};

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
