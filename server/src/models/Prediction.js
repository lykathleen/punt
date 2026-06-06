import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true
    },
    competitionId: {
      type: String,
      required: true
    },
    predictedScore: {
      home: {
        type: Number,
        required: true
      },
      away: {
        type: Number,
        required: true
      }
    },
    status: {
      type: String,
      enum: ["active", "locked", "scored"],
      default: "active"
    },
    lockedAt: Date
  },
  { timestamps: true }
);

predictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export const Prediction =
  mongoose.models.Prediction ?? mongoose.model("Prediction", predictionSchema);
