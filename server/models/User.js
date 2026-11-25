import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  emailVerified: { type: Boolean, default: true },
  emailVerificationCodeHash: { type: String, select: false },
  emailVerificationExpiresAt: { type: Date, select: false },
  emailVerificationSentAt: { type: Date, select: false },
  emailVerificationAttempts: { type: Number, default: 0, select: false },
  bio: { type: String, maxlength: 200, default: '' },
  avatarUrl: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationCodeHash;
  delete obj.emailVerificationExpiresAt;
  delete obj.emailVerificationSentAt;
  delete obj.emailVerificationAttempts;
  delete obj.__v;
  return obj;
};
export default mongoose.model('User', userSchema);
