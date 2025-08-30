import mongoose, { Schema, Document } from 'mongoose';

export interface IAiModel extends Document {
  provider: 'OpenAI' | 'Google' | 'Anthropic';
  modelName: string;
  displayName: string;
}

const aiModelSchema = new Schema<IAiModel>({
  provider: { type: String, required: true, enum: ['OpenAI', 'Google', 'Anthropic'] },
  modelName: { type: String, required: false, unique: true }, // e.g., "gpt-4o"
  displayName: { type: String, required: true },
}, { timestamps: true });

const AiModel = mongoose.model<IAiModel>('AiModel', aiModelSchema);
export default AiModel;