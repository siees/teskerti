import { Document, model, Model, Schema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface PaymentDoc extends Document {
  orderId: string;
  stripeId: string;
  version: number;
}

interface PaymentModel extends Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new Schema(
  {
    orderId: { required: true, type: String },
    stripeId: { required: true, type: String },
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
paymentSchema.set('versionKey', 'version');

paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
