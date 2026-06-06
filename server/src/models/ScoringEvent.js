import mongoose from "mongoose";

const scoringEventSchema = new mongoose.Schema(
  {
    competitionId: {
      type: String,
      required: true
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prediction",
      required: true
    },
    eventType: {
      type: String,
      enum: ["match_scored"],
      default: "match_scored"
    },
    pointsBefore: Number,
    pointsAwarded: Number,
    pointsAfter: Number,
    breakdown: {
      exactScore: Number,
      winnerCorrect: Number,
      goalDifference: Number,
      bonus: Number
    }
  },
  { timestamps: true }
);

scoringEventSchema.index({ competitionId: 1, createdAt: 1 });
scoringEventSchema.index({ userId: 1 });
scoringEventSchema.index({ matchId: 1 });

export const ScoringEvent =
  mongoose.models.ScoringEvent ?? mongoose.model("ScoringEvent", scoringEventSchema);
