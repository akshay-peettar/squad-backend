import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApiCallLog extends Document {
  owner: Types.ObjectId;
  userAgent: Types.ObjectId;
  provider: 'Google' | 'OpenAI' | 'Anthropic';
  prompt: string;
  // We can add the full context later when we build the "Shared Brain"
  // context: any; 
  response: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number; // Time in milliseconds
  cost: number; // Estimated cost in USD
}

const apiCallLogSchema = new Schema<IApiCallLog>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userAgent: { type: Schema.Types.ObjectId, ref: 'UserAgent', required: true },
  provider: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  promptTokens: { type: Number, required: true },
  completionTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  latency: { type: Number, required: true },
  cost: { type: Number, default: 0 },
}, { timestamps: true });

const ApiCallLog = mongoose.model<IApiCallLog>('ApiCallLog', apiCallLogSchema);
export default ApiCallLog;