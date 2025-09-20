import mongoose, { Schema, Document, Types } from 'mongoose';
import CryptoService from '../services/cryptoService';

export interface IUserAgent extends Document {
  owner: Types.ObjectId;
  aiModel: Types.ObjectId; // Reference to the AiModel catalog
  customName: string; // User-defined name, e.g., "My Creative Writer"
  apiKey: string;
}

const userAgentSchema = new Schema<IUserAgent>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  aiModel: { type: Schema.Types.ObjectId, ref: 'AiModel', required: true },
  customName: { type: String, required: true },
  apiKey: { type: String, required: false },
}, { timestamps: true });

// Encrypt the API key before saving
// userAgentSchema.pre('save', function(next) {
//   if (this.isModified('apiKey')) {
//     this.apiKey = CryptoService.encrypt(this.apiKey);
//   }
//   next();
// });

const UserAgent = mongoose.model<IUserAgent>('UserAgent', userAgentSchema);
export default UserAgent;