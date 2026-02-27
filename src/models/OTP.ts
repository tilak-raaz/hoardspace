import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  phone?: string;
  email?: string;
  otp: string;
  type: 'verification' | 'login' | 'reset';
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema: Schema<IOTP> = new Schema({
  phone: { type: String },
  email: { type: String },
  otp: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['verification', 'login', 'reset'], 
    default: 'verification' 
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index for automatic deletion of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (process.env.NODE_ENV === 'development' && mongoose.models.OTP) {
  delete mongoose.models.OTP;
}

const OTPModel: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTPModel;
