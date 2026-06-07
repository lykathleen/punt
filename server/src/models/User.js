import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    supabaseUserId: {
      type: String,
      unique: true,
      sparse: true
    },
    totalPointsByCompetition: {
      type: Map,
      of: Number,
      default: {}
    },
    currentRankByCompetition: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
