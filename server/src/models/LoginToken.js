import mongoose from "mongoose";

const loginTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    usedAt: Date
  },
  { timestamps: true }
);

loginTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
loginTokenSchema.index({ email: 1, createdAt: -1 });

export const LoginToken =
  mongoose.models.LoginToken ?? mongoose.model("LoginToken", loginTokenSchema);
