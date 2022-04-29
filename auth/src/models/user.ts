import { Schema, Model, model } from 'mongoose';

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
interface UserDoc {
  email: string;
  password: string;
}

const userSchema = new Schema({
  email: { type: String, required: true, index: true },
  password: { type: String, required: true },
});
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = model<UserDoc, UserModel>('User', userSchema);

export { User };
