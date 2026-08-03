import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Development', 'Communication', 'AI', 'Marketing', 'Productivity'],
      default: 'Development',
    },
    icon: {
      type: String,
      default: 'Zap',
    },
    definition: {
      type: Object,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Template = mongoose.model('Template', templateSchema);
