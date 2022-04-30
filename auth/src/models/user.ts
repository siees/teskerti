import { Schema, Model, model, Document } from 'mongoose';

import { Password } from '../services/password';

//interface that describes the properties
//that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

//interface that describes the properties
//that a User Model has
interface UserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//interface that describes the properties
//that a User Document has
interface UserDoc extends Document {
  email: string;
  password: string;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = model<UserDoc, UserModel>('User', userSchema);

export { User };
