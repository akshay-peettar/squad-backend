import mongoose, { Document, Model, Schema, Types } from 'mongoose';

interface IChat extends Document {
  title: string;
  user: Types.ObjectId;
  agents: Types.ObjectId[];
}

interface IChatModel extends Model<IChat> {}

const chatSchema = new Schema<IChat, IChatModel>({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'New Chat'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agents: [{
    type: Schema.Types.ObjectId,
    ref: 'UserAgent'
  }]
}, {
  timestamps: true,
});

const Chat = mongoose.model<IChat, IChatModel>('Chat', chatSchema);
export default Chat;