// server/src/models/messageModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  senderType: 'User' | 'AI';
  // Conditionally required fields based on senderType
  userSender?: Types.ObjectId;   // Reference to the User model
  agentSender?: Types.ObjectId;  // Reference to the UserAgent model
}

const messageSchema: Schema = new Schema<IMessage>({
  text: { 
    type: String, 
    required: true 
  },
  senderType: { 
    type: String, 
    required: true, 
    enum: ['User', 'AI'] 
  },
  userSender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    // required:true
    // // This field is only required if the sender is a 'User'
    required: function(this: IMessage) {
      return this.senderType === 'User';
    } 
  },
  agentSender: { 
    type: Schema.Types.ObjectId, 
    ref: 'UserAgent',
    // This field is only required if the sender is an 'AI'
    required: function(this: IMessage) {
      return this.senderType === 'AI';
    }
  },
}, { timestamps: true });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;