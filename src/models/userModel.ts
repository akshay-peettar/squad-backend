import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// --- NEW: Define the properties of a User document ---
interface IUser extends Document {
  username: string;
  email: string; // Added email field
  password: string;
  matchPassword(enteredPassword: string): Promise<boolean>; // Tell TS about our custom method
}

interface IUserModel extends Model<IUser> {}

const userSchema = new mongoose.Schema<IUser, IUserModel>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Add the method to the schema to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  console.log("Comparing passwords:", enteredPassword, this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add a "pre-save" hook to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Now we create the model using our defined interfaces
const User = mongoose.model<IUser, IUserModel>('User', userSchema);
export default User;