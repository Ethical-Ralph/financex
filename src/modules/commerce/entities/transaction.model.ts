import { Schema, Document, model } from 'mongoose';

export interface Transaction extends Document {
  businessId: string;
  departmentId: string;
  orderId: string;
  totalAmount: number;
}

const TransactionSchema = new Schema(
  {
    businessId: { type: String, required: true },
    departmentId: { type: String, required: true },
    orderId: { type: String, required: true },
    totalAmount: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const TransactionModel = model<Transaction>(
  'transaction',
  TransactionSchema,
);
